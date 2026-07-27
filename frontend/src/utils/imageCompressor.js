/**
 * Client-side HTML5 Canvas Image Compression Utility
 * Resizes large images to max dimensions and compresses to lightweight WebP/JPEG formats.
 */
export async function compressImage(file, maxWidth = 1600, maxHeight = 1600, quality = 0.8) {
  if (!file || !file.type.startsWith('image/') || file.type === 'image/gif') {
    return file; // Skip non-images and animated GIFs
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving bounds
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // Return original file if compression didn't shrink size
              resolve(file);
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: blob.type,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          targetMime,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}

export default compressImage;
