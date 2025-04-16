// src/components/BlogPost.js
import React from 'react';
import '../styles/blogPost.css'; // Create this CSS file for styling

function BlogPost({ post }) {
  // Helper function for slideshows (basic example)
  const renderSlideshow = (imageUrls) => {
    // You'd likely use a carousel library here (e.g., react-slick, swiper)
    return (
      <div className="post-slideshow">
        {imageUrls.map((url, index) => (
          <img key={index} src={url} alt={`Slide ${index + 1}`} loading="lazy" />
        ))}
        <p><em>Basic Slideshow Placeholder</em></p>
      </div>
    );
  };

  return (
    <article className={`blog-post post-type-${post.type}`}>
      {post.title && <h2 className="post-title">{post.title}</h2>}

      {/* Conditionally render based on post type */}
      {post.type === 'image_text' && (
        <>
          {post.imageUrl && <img src={post.imageUrl} alt={post.title || 'Blog post image'} className="post-image" loading="lazy" />}
          {post.text && <div className="post-text" dangerouslySetInnerHTML={{ __html: post.text /* Or render markdown safely */ }}></div>}
        </>
      )}

      {post.type === 'video' && post.videoUrl && (
        <div className="post-video-wrapper">
           {/* Basic video embed - consider a responsive player library */}
           <video controls src={post.videoUrl} className="post-video">
               Your browser does not support the video tag.
           </video>
        </div>
      )}

       {post.type === 'image_audio' && (
         <>
            {post.imageUrl && <img src={post.imageUrl} alt={post.title || 'Blog post image'} className="post-image" loading="lazy" />}
             {post.audioUrl && (
               <div className="post-audio">
                 {/* Simple HTML5 audio player */}
                 <audio controls src={post.audioUrl}>
                   Your browser does not support the audio element.
                 </audio>
                 {/* Download link */}
                 <a
                   href={post.audioUrl}
                   download={post.audioFilename || 'download.mp3'} // Use filename from backend if available
                   className="post-audio-download"
                 >
                   Download MP3
                 </a>
               </div>
             )}
             {post.text && <div className="post-text" dangerouslySetInnerHTML={{ __html: post.text }}></div>}
         </>
       )}

      {post.type === 'slideshow' && post.imageUrls && post.imageUrls.length > 0 && (
        renderSlideshow(post.imageUrls)
      )}

       {post.type === 'text' && post.text && (
         <div className="post-text" dangerouslySetInnerHTML={{ __html: post.text }}></div>
       )}


      {/* Add post metadata if available (date, author, etc.) */}
      {/* <div className="post-meta">Posted on {new Date(post.createdAt).toLocaleDateString()}</div> */}
    </article>
  );
}

export default BlogPost;