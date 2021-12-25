import { DotsHorizontalIcon } from "@heroicons/react/outline";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { modalEditState, postIdState } from "../atoms/modalAtom";
import { db } from "../firebase";

function DropDown({ id }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditOpen, setIsEditOpen] = useRecoilState(modalEditState);
  const [postId, setPostId] = useRecoilState(postIdState);
  const router = useRouter();
  const toggle = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div
      className="icon group flex-shrink-0 ml-auto"
      id="menu-button"
      aria-expanded="true"
      aria-haspopup="true"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
    >
      <div className="relative inline-block text-left">
        <div>
          <DotsHorizontalIcon className="h-5 text-[#6e767d] group-hover:text-[#1d9bf0]" />
        </div>

        {showDropdown && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-24 rounded-md bg-[#15202b]  shadow-lg ring-1 ring-white ring-opacity-20 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
            tabIndex="-1"
          >
            <div role="none">
              <h4
                onClick={(e) => {
                  e.stopPropagation();
                  setPostId(id);
                  setIsEditOpen(true);
                  toggle();
                }}
                className="text-white hoverAnimation rounded-md  block px-4 py-2 text-sm"
                role="menuitem"
                tabIndex="-1"
                id="menu-item-0"
              >
                Edit
              </h4>
              <h4
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDoc(doc(db, "posts", id));
                  router.push("/");
                }}
                className="text-white hoverAnimation rounded-md block px-4 py-2 text-sm"
                role="menuitem"
                tabIndex="-1"
                id="menu-item-1"
              >
                Delete
              </h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DropDown;
