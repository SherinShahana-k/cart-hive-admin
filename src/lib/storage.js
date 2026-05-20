import { supabase } from './supabase';

/**
 * Uploads an image picked via expo-image-picker to a Supabase bucket
 * @param {string} localUri - The local URI of the image (file:// or ph://)
 * @param {string} bucket - The destination bucket ('products', 'homepage', 'logos')
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadImage = async (localUri, bucket) => {
  try {
    // 1. Fetch file contents as a raw Blob
    const response = await fetch(localUri);
    const blob = await response.blob();
    
    // 2. Extract extension and generate a clean unique filename
    const fileExt = localUri.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. Upload the binary Blob to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Supabase Native Upload Error:', uploadError);
      throw uploadError;
    }

    // 4. Retrieve Public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!data || !data.publicUrl) {
      throw new Error('Supabase failed to resolve a public URL for the file.');
    }

    const finalUrl = data.publicUrl.trim();
    console.log('NATIVE UPLOAD SUCCESS. URL:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Native uploadImage error:', error);
    throw error;
  }
};
