const generateSignature = async (publicId, timestamp) => {
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    throw new Error('Cloudinary API secret is not configured');
  }
  
  // Create the string to sign
  const str = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  
  // Generate SHA-1 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  
  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

export default generateSignature;
