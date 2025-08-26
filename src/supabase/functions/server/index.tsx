import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS and logging
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Initialize storage buckets on startup
const initStorageBuckets = async () => {
  try {
    const bucketName = 'make-14bee57a-user-uploads'
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      console.log('Creating storage bucket:', bucketName)
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 10485760 // 10MB
      })
      if (error) {
        console.error('Error creating bucket:', error)
      } else {
        console.log('Storage bucket created successfully')
      }
    } else {
      console.log('Storage bucket already exists:', bucketName)
    }
  } catch (error) {
    console.error('Error initializing storage:', error)
  }
}

// Initialize on startup
initStorageBuckets()

// Helper function to get user ID from access token
async function getUserId(request: Request): Promise<string | null> {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Authorization error:', error?.message || 'No user found')
      return null;
    }
    return user.id;
  } catch (error) {
    console.log('Auth verification error:', error)
    return null;
  }
}

// Helper function to validate timeline data
function validateTimelineData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.timelinePoints)) return false;
  
  return data.timelinePoints.every((point: any) => 
    typeof point.year === 'string' &&
    typeof point.period === 'string' &&
    typeof point.description === 'string' &&
    typeof point.image === 'string' &&
    typeof point.position === 'number'
  );
}

// Health check endpoint
app.get('/make-server-14bee57a/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['auth', 'objects', 'collections', 'storage']
  })
})

// ===== AUTHENTICATION ENDPOINTS =====

// Sign up route
app.post('/make-server-14bee57a/auth/signup', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, name } = body
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400)
    }

    // Validate password strength
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      user_metadata: { name: name.trim() },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log(`Authorization error while signing up user: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }

    // Initialize user data with error handling
    try {
      await kv.set(`user:${data.user.id}:profile`, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        created_at: new Date().toISOString(),
        objects_explored: 0,
        collections_created: 0
      })

      // Initialize empty arrays for user data
      await kv.set(`user:${data.user.id}:objects`, [])
      await kv.set(`user:${data.user.id}:collections`, [])

    } catch (kvError) {
      console.error('Error initializing user data:', kvError)
      // Continue anyway as the user was created successfully
    }

    return c.json({ 
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name.trim()
      }
    })
  } catch (error) {
    console.log(`Internal server error during signup: ${error}`)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Get user profile
app.get('/make-server-14bee57a/auth/profile', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized - invalid or missing token' }, 401);
    }

    const profile = await kv.get(`user:${userId}:profile`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Get additional stats
    const objects = await kv.get(`user:${userId}:objects`) || []
    const collections = await kv.get(`user:${userId}:collections`) || []

    return c.json({ 
      profile: {
        ...profile,
        objects_explored: objects.length,
        collections_created: collections.length
      }
    });
  } catch (error) {
    console.log(`Internal server error getting profile: ${error}`)
    return c.json({ error: 'Internal server error getting profile' }, 500)
  }
})

// Update user profile
app.put('/make-server-14bee57a/auth/profile', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name } = await c.req.json()
    if (!name || name.trim().length === 0) {
      return c.json({ error: 'Name is required' }, 400)
    }

    const profile = await kv.get(`user:${userId}:profile`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...profile,
      name: name.trim(),
      updated_at: new Date().toISOString()
    }

    await kv.set(`user:${userId}:profile`, updatedProfile)

    return c.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.log(`Internal server error updating profile: ${error}`)
    return c.json({ error: 'Internal server error updating profile' }, 500)
  }
})

// ===== OBJECT MANAGEMENT ENDPOINTS =====

// Save explored object
app.post('/make-server-14bee57a/objects/save', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json()
    const { objectName, timelineData, category, userImage } = body
    
    if (!objectName || !timelineData) {
      return c.json({ error: 'Object name and timeline data are required' }, 400)
    }

    if (!validateTimelineData(timelineData)) {
      return c.json({ error: 'Invalid timeline data format' }, 400)
    }

    const objectId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const exploredObject = {
      id: objectId,
      name: objectName.trim(),
      category: category || 'General',
      timelineData: timelineData,
      exploredAt: new Date().toISOString(),
      userId: userId,
      userImage: userImage || null // Store user image metadata if provided
    }

    await kv.set(`user:${userId}:object:${objectId}`, exploredObject)
    
    // Add to user's object list
    const userObjects = await kv.get(`user:${userId}:objects`) || []
    
    // Check if object with same name already exists and remove it
    const existingIndex = userObjects.findIndex(async (id: string) => {
      const existing = await kv.get(`user:${userId}:object:${id}`)
      return existing?.name === objectName.trim()
    })
    
    userObjects.unshift(objectId) // Add to beginning
    
    // Keep only last 50 objects
    if (userObjects.length > 50) {
      const removedIds = userObjects.splice(50)
      // Clean up removed objects and their associated images
      for (const removedId of removedIds) {
        const removedObject = await kv.get(`user:${userId}:object:${removedId}`)
        
        // Clean up user uploaded image if it exists
        if (removedObject?.userImage?.fileName) {
          try {
            await supabase.storage
              .from('make-14bee57a-user-uploads')
              .remove([removedObject.userImage.fileName])
          } catch (storageError) {
            console.log('Error removing old user image:', storageError)
            // Don't fail the operation if storage cleanup fails
          }
        }
        
        await kv.del(`user:${userId}:object:${removedId}`)
      }
    }
    
    await kv.set(`user:${userId}:objects`, userObjects)

    return c.json({ 
      message: 'Object saved successfully',
      object: exploredObject,
      hasUserImage: !!userImage
    })
  } catch (error) {
    console.log(`Internal server error saving object: ${error}`)
    return c.json({ error: 'Internal server error saving object' }, 500)
  }
})

// Get user's explored objects
app.get('/make-server-14bee57a/objects', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const objectIds = await kv.get(`user:${userId}:objects`) || []
    const objects = []
    
    for (const objectId of objectIds) {
      try {
        const object = await kv.get(`user:${userId}:object:${objectId}`)
        if (object) {
          objects.push(object)
        }
      } catch (error) {
        console.log(`Error loading object ${objectId}:`, error)
        // Continue with other objects
      }
    }

    return c.json({ objects })
  } catch (error) {
    console.log(`Internal server error getting objects: ${error}`)
    return c.json({ error: 'Internal server error getting objects' }, 500)
  }
})

// Get specific object
app.get('/make-server-14bee57a/objects/:objectId', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const objectId = c.req.param('objectId')
    if (!objectId) {
      return c.json({ error: 'Object ID is required' }, 400)
    }

    const object = await kv.get(`user:${userId}:object:${objectId}`)
    
    if (!object) {
      return c.json({ error: 'Object not found' }, 404)
    }

    return c.json({ object })
  } catch (error) {
    console.log(`Internal server error getting object: ${error}`)
    return c.json({ error: 'Internal server error getting object' }, 500)
  }
})

// Delete object
app.delete('/make-server-14bee57a/objects/:objectId', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const objectId = c.req.param('objectId')
    if (!objectId) {
      return c.json({ error: 'Object ID is required' }, 400)
    }
    
    // Check if object exists and belongs to user
    const object = await kv.get(`user:${userId}:object:${objectId}`)
    if (!object) {
      return c.json({ error: 'Object not found' }, 404)
    }
    
    // Clean up user uploaded image if it exists
    if (object.userImage?.fileName) {
      try {
        await supabase.storage
          .from('make-14bee57a-user-uploads')
          .remove([object.userImage.fileName])
      } catch (storageError) {
        console.log('Error removing user image:', storageError)
        // Don't fail the operation if storage cleanup fails
      }
    }
    
    // Remove from user's object list
    const userObjects = await kv.get(`user:${userId}:objects`) || []
    const updatedObjects = userObjects.filter((id: string) => id !== objectId)
    await kv.set(`user:${userId}:objects`, updatedObjects)
    
    // Delete the object data
    await kv.del(`user:${userId}:object:${objectId}`)

    // Remove from any collections
    const collections = await kv.get(`user:${userId}:collections`) || []
    for (const collectionId of collections) {
      const collection = await kv.get(`user:${userId}:collection:${collectionId}`)
      if (collection && collection.objectIds.includes(objectId)) {
        collection.objectIds = collection.objectIds.filter((id: string) => id !== objectId)
        await kv.set(`user:${userId}:collection:${collectionId}`, collection)
      }
    }

    return c.json({ message: 'Object deleted successfully' })
  } catch (error) {
    console.log(`Internal server error deleting object: ${error}`)
    return c.json({ error: 'Internal server error deleting object' }, 500)
  }
})

// ===== COLLECTION MANAGEMENT ENDPOINTS =====

// Create collection
app.post('/make-server-14bee57a/collections', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json()
    const { name, description, objectIds } = body
    
    if (!name || name.trim().length === 0) {
      return c.json({ error: 'Collection name is required' }, 400)
    }

    const collectionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const collection = {
      id: collectionId,
      name: name.trim(),
      description: description?.trim() || '',
      objectIds: Array.isArray(objectIds) ? objectIds : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId
    }

    await kv.set(`user:${userId}:collection:${collectionId}`, collection)
    
    // Add to user's collection list
    const userCollections = await kv.get(`user:${userId}:collections`) || []
    userCollections.unshift(collectionId)
    await kv.set(`user:${userId}:collections`, userCollections)

    return c.json({ 
      message: 'Collection created successfully',
      collection: collection
    })
  } catch (error) {
    console.log(`Internal server error creating collection: ${error}`)
    return c.json({ error: 'Internal server error creating collection' }, 500)
  }
})

// Get user's collections
app.get('/make-server-14bee57a/collections', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const collectionIds = await kv.get(`user:${userId}:collections`) || []
    const collections = []
    
    for (const collectionId of collectionIds) {
      try {
        const collection = await kv.get(`user:${userId}:collection:${collectionId}`)
        if (collection) {
          // Get preview objects with their images
          const objects = []
          for (const objectId of collection.objectIds.slice(0, 4)) {
            const object = await kv.get(`user:${userId}:object:${objectId}`)
            if (object) {
              objects.push(object)
            }
          }
          
          collections.push({
            ...collection,
            items: collection.objectIds.length,
            objects: objects,
            preview: objects.map(obj => {
              // Get a representative image from timeline
              const timeline = obj.timelineData?.timelinePoints || []
              return timeline.length > 0 ? timeline[Math.floor(timeline.length / 2)]?.image : ''
            }).filter(Boolean)
          })
        }
      } catch (error) {
        console.log(`Error loading collection ${collectionId}:`, error)
        // Continue with other collections
      }
    }

    return c.json({ collections })
  } catch (error) {
    console.log(`Internal server error getting collections: ${error}`)
    return c.json({ error: 'Internal server error getting collections' }, 500)
  }
})

// Get specific collection
app.get('/make-server-14bee57a/collections/:collectionId', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const collectionId = c.req.param('collectionId')
    if (!collectionId) {
      return c.json({ error: 'Collection ID is required' }, 400)
    }

    const collection = await kv.get(`user:${userId}:collection:${collectionId}`)
    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    // Get all objects in collection
    const objects = []
    for (const objectId of collection.objectIds) {
      const object = await kv.get(`user:${userId}:object:${objectId}`)
      if (object) {
        objects.push(object)
      }
    }

    return c.json({ 
      collection: {
        ...collection,
        objects: objects
      }
    })
  } catch (error) {
    console.log(`Internal server error getting collection: ${error}`)
    return c.json({ error: 'Internal server error getting collection' }, 500)
  }
})

// Update collection
app.put('/make-server-14bee57a/collections/:collectionId', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const collectionId = c.req.param('collectionId')
    if (!collectionId) {
      return c.json({ error: 'Collection ID is required' }, 400)
    }

    const collection = await kv.get(`user:${userId}:collection:${collectionId}`)
    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    const body = await c.req.json()
    const { name, description } = body

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return c.json({ error: 'Collection name cannot be empty' }, 400)
      }
      collection.name = name.trim()
    }

    if (description !== undefined) {
      collection.description = description?.trim() || ''
    }

    collection.updatedAt = new Date().toISOString()

    await kv.set(`user:${userId}:collection:${collectionId}`, collection)

    return c.json({ 
      message: 'Collection updated successfully',
      collection: collection
    })
  } catch (error) {
    console.log(`Internal server error updating collection: ${error}`)
    return c.json({ error: 'Internal server error updating collection' }, 500)
  }
})

// Delete collection
app.delete('/make-server-14bee57a/collections/:collectionId', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const collectionId = c.req.param('collectionId')
    if (!collectionId) {
      return c.json({ error: 'Collection ID is required' }, 400)
    }

    // Check if collection exists
    const collection = await kv.get(`user:${userId}:collection:${collectionId}`)
    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    // Remove from user's collections list
    const userCollections = await kv.get(`user:${userId}:collections`) || []
    const updatedCollections = userCollections.filter((id: string) => id !== collectionId)
    await kv.set(`user:${userId}:collections`, updatedCollections)

    // Delete the collection
    await kv.del(`user:${userId}:collection:${collectionId}`)

    return c.json({ message: 'Collection deleted successfully' })
  } catch (error) {
    console.log(`Internal server error deleting collection: ${error}`)
    return c.json({ error: 'Internal server error deleting collection' }, 500)
  }
})

// Add object to collection
app.post('/make-server-14bee57a/collections/:collectionId/objects', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const collectionId = c.req.param('collectionId')
    const body = await c.req.json()
    const { objectId } = body
    
    if (!objectId) {
      return c.json({ error: 'Object ID is required' }, 400)
    }

    const collection = await kv.get(`user:${userId}:collection:${collectionId}`)
    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    // Verify object exists and belongs to user
    const object = await kv.get(`user:${userId}:object:${objectId}`)
    if (!object) {
      return c.json({ error: 'Object not found' }, 404)
    }

    if (!collection.objectIds.includes(objectId)) {
      collection.objectIds.push(objectId)
      collection.updatedAt = new Date().toISOString()
      await kv.set(`user:${userId}:collection:${collectionId}`, collection)
    }

    return c.json({ message: 'Object added to collection successfully' })
  } catch (error) {
    console.log(`Internal server error adding object to collection: ${error}`)
    return c.json({ error: 'Internal server error adding object to collection' }, 500)
  }
})

// Remove object from collection
app.delete('/make-server-14bee57a/collections/:collectionId/objects/:objectId', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const collectionId = c.req.param('collectionId')
    const objectId = c.req.param('objectId')

    const collection = await kv.get(`user:${userId}:collection:${collectionId}`)
    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    collection.objectIds = collection.objectIds.filter((id: string) => id !== objectId)
    collection.updatedAt = new Date().toISOString()
    await kv.set(`user:${userId}:collection:${collectionId}`, collection)

    return c.json({ message: 'Object removed from collection successfully' })
  } catch (error) {
    console.log(`Internal server error removing object from collection: ${error}`)
    return c.json({ error: 'Internal server error removing object from collection' }, 500)
  }
})

// ===== FILE UPLOAD ENDPOINTS =====

// Upload image
app.post('/make-server-14bee57a/upload/image', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.arrayBuffer()
    if (!body || body.byteLength === 0) {
      return c.json({ error: 'No image data provided' }, 400)
    }

    // Check file size (10MB limit)
    if (body.byteLength > 10485760) {
      return c.json({ error: 'File too large. Maximum size is 10MB' }, 400)
    }

    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
    const bucketName = 'make-14bee57a-user-uploads'

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, body, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      })

    if (error) {
      console.log('Storage upload error:', error)
      return c.json({ error: 'Failed to upload image' }, 500)
    }

    // Get signed URL for the uploaded file
    const { data: signedUrl } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600) // 1 hour expiry

    return c.json({ 
      message: 'Image uploaded successfully',
      fileName: fileName,
      url: signedUrl?.signedUrl || '',
      path: data.path
    })
  } catch (error) {
    console.log(`Internal server error uploading image: ${error}`)
    return c.json({ error: 'Internal server error uploading image' }, 500)
  }
})

// Get signed URL for existing image
app.get('/make-server-14bee57a/images/:fileName', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const fileName = c.req.param('fileName')
    if (!fileName) {
      return c.json({ error: 'File name is required' }, 400)
    }

    // Verify the file belongs to the user (check path starts with userId)
    if (!fileName.startsWith(userId + '/')) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const bucketName = 'make-14bee57a-user-uploads'
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600) // 1 hour expiry

    if (error) {
      console.log('Error creating signed URL:', error)
      return c.json({ error: 'File not found' }, 404)
    }

    return c.json({ 
      url: data.signedUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    })
  } catch (error) {
    console.log(`Internal server error getting image: ${error}`)
    return c.json({ error: 'Internal server error getting image' }, 500)
  }
})

// ===== ANALYTICS ENDPOINTS =====

// Get user statistics
app.get('/make-server-14bee57a/stats', async (c) => {
  try {
    const userId = await getUserId(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${userId}:profile`) || {}
    const objects = await kv.get(`user:${userId}:objects`) || []
    const collections = await kv.get(`user:${userId}:collections`) || []

    // Calculate category breakdown
    const categoryCount: Record<string, number> = {}
    for (const objectId of objects) {
      const object = await kv.get(`user:${userId}:object:${objectId}`)
      if (object) {
        const category = object.category || 'General'
        categoryCount[category] = (categoryCount[category] || 0) + 1
      }
    }

    return c.json({
      user: {
        name: profile.name || 'User',
        memberSince: profile.created_at || new Date().toISOString()
      },
      stats: {
        totalObjects: objects.length,
        totalCollections: collections.length,
        categoriesExplored: Object.keys(categoryCount).length,
        categoryBreakdown: categoryCount,
        lastActive: new Date().toISOString()
      }
    })
  } catch (error) {
    console.log(`Internal server error getting stats: ${error}`)
    return c.json({ error: 'Internal server error getting stats' }, 500)
  }
})

// Catch-all error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ 
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404)
})

Deno.serve(app.fetch)