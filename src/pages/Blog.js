// src/pages/Blog.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import BlogPost from '../components/BlogPost'; // Import the post component
import '../styles/blogPage.css'; // Create this CSS file

// --- MOCK API FUNCTION ---
// Replace this with your actual API call using fetch or axios
async function fetchBlogPosts(page = 1, limit = 10) {
  console.log(`Workspaceing page ${page}...`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // ** REPLACE THIS WITH YOUR ACTUAL API CALL **
  // Example: const response = await fetch(`/api/posts?page=${page}&limit=${limit}`);
  // const data = await response.json();
  // return data; // Should return { posts: [...], hasMore: boolean }

  // --- Mock Data Generation ---
  const totalPosts = 50; // Example total
  const posts = [];
  const startId = (page - 1) * limit + 1;
  const endId = Math.min(startId + limit - 1, totalPosts);

  if (startId > totalPosts) {
    return { posts: [], hasMore: false }; // No more posts
  }

  for (let i = startId; i <= endId; i++) {
     // Cycle through post types for variety
     const typeIndex = i % 5;
     let postData = { id: i, title: `Blog Post ${i}` };

     if (typeIndex === 0) { // Image + Text
        postData = { ...postData, type: 'image_text', imageUrl: `https://picsum.photos/seed/${i}/600/400`, text: `<p>This is the content for blog post number ${i}. It includes some <strong>bold text</strong> and an image above.</p><p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>` };
     } else if (typeIndex === 1) { // Video (use a placeholder)
        // Replace with real video URLs when you have them
        postData = { ...postData, type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }; // Placeholder video
     } else if (typeIndex === 2) { // Image + Audio
         // Replace with real audio URLs and filenames
         postData = { ...postData, type: 'image_audio', imageUrl: `https://picsum.photos/seed/${i+100}/600/300`, audioUrl: '/placeholder-audio.mp3', /* Create a dummy mp3 in public folder */ audioFilename: `cool_track_${i}.mp3`, text: `<p>Listen to this track below. Image included too!</p>`};
     } else if (typeIndex === 3) { // Text only
         postData = { ...postData, type: 'text', text: `<p>This is a text-only post (number ${i}). Ideal for short updates or thoughts.</p><ul><li>Point 1</li><li>Point 2</li></ul>`};
     } else { // Slideshow
          postData = { ...postData, type: 'slideshow', imageUrls: [`https://picsum.photos/seed/${i+200}/500/350`, `https://picsum.photos/seed/${i+300}/500/350`, `https://picsum.photos/seed/${i+400}/500/350`] };
     }
    posts.push(postData);
  }
  const hasMore = endId < totalPosts;
  console.log('Returning:', { posts, hasMore });
  return { posts, hasMore };
  // --- End Mock Data ---
}
// --- END MOCK API FUNCTION ---


function Blog() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const initialLoadDone = useRef(false); // Prevent effect trigger on initial mount interaction

  // `ref` from useInView will be attached to the loader element
  // `inView` will be true when the element is visible
  const { ref, inView } = useInView({
     threshold: 0, // Trigger as soon as the element enters the viewport
     // triggerOnce: false // Keep observing
  });


  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return; // Don't load if already loading or no more posts

    setLoading(true);
    try {
        // Pass the *next* page number to fetch
      const nextPage = page; // Use current page state
      const data = await fetchBlogPosts(nextPage, 5); // Fetch 5 posts per page (adjust limit)

       // Important: Filter out duplicate posts if any overlap occurs
       // (Might happen with rapid scrolling, though less likely with IntersectionObserver)
       const newPosts = data.posts.filter(newPost =>
            !posts.some(existingPost => existingPost.id === newPost.id)
       );

      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setHasMore(data.hasMore);
      if(data.hasMore) {
        setPage(prevPage => prevPage + 1); // Increment page number *after* successful fetch
      }

    } catch (error) {
      console.error("Failed to fetch posts:", error);
      // Handle error state if needed
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, posts]); // Include posts in dependencies if filtering duplicates


   // Effect for initial load
   useEffect(() => {
     loadMorePosts();
     initialLoadDone.current = true; // Mark initial load as done
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Run only once on mount


  // Effect to load more when the trigger element (ref) is in view
  useEffect(() => {
     // Only load more if the trigger is in view, it's not already loading,
     // there are more posts, AND the initial load has completed.
    if (inView && !loading && hasMore && initialLoadDone.current) {
      loadMorePosts();
    }
  }, [inView, loading, hasMore, loadMorePosts]);


  return (
    <div className="blog-page">
      <header className="blog-header">
          <h1>Something Vague *Blog*</h1>
          <p>updates and insights</p>
      </header>

      <div className="blog-posts-container">
        {posts.map((post) => (
          <BlogPost key={post.id} post={post} />
        ))}

        {/* Loader/Trigger Element */}
        {/* The ref is attached here. When this div scrolls into view, `inView` becomes true. */}
        {hasMore && (
            <div ref={ref} className="loader-trigger">
                {loading && <p>Loading more posts...</p>}
            </div>
        )}

        {!loading && !hasMore && posts.length > 0 && (
            <p className="end-of-posts-message">You've reached the end!</p>
        )}

         {!loading && !hasMore && posts.length === 0 && (
             <p>No posts found.</p>
         )}
      </div>
    </div>
  );
}

export default Blog;