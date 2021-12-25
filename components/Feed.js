import { SparklesIcon } from "@heroicons/react/outline";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import Input from "./Input";
import Post from "./Post";

function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "posts"), orderBy("timestamp", "desc")),
      (snapshot) => {
        setPosts(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      }
    );

    return unsub;
  }, [db]);

  return (
    <div className="flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]">
      <div className="text-[#d9d9d9] flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 bg-[#15202b] border-b border-gray-700">
        <h2 className="text-lg sm:text-xl font-bold">Home</h2>
        <div className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 ml-auto">
          <SparklesIcon className="h-5 text-white" />
        </div>
      </div>
      <Input />
      <div className="pb-72">
        {posts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            userId={post.userId}
            image={post.image}
            tag={post.tag}
            text={post.text}
            timestamp={post.timestamp}
            userImg={post.userImg}
            username={post.username}
            edited={post.edited}
          />
        ))}
      </div>
    </div>
  );
}

export default Feed;
