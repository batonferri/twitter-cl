import {
  CalendarIcon,
  ChartBarIcon,
  EmojiHappyIcon,
  PhotographIcon,
} from "@heroicons/react/outline";
import { useRecoilState } from "recoil";
import { modalEditState, postIdState } from "../atoms/modalAtom";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { XIcon } from "@heroicons/react/outline";
import { useSession } from "next-auth/react";
import { Picker } from "emoji-mart";
import {
  onSnapshot,
  doc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "@firebase/firestore";
import { getDownloadURL, ref, uploadString } from "@firebase/storage";
import { db, storage } from "../firebase";

function EditModal() {
  const [isEditOpen, setIsEditOpen] = useRecoilState(modalEditState);
  const [postId, setPostId] = useRecoilState(postIdState);
  const { data: session } = useSession();
  const [post, setPost] = useState();
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [loading, setLoading] = useState(false);
  const filePickerRef = useRef(null);

  useEffect(
    () =>
      onSnapshot(doc(db, "posts", postId), (snapshot) => {
        setInput(snapshot.data().text);
        setSelectedImage(snapshot.data().image);
      }),
    [db, postId]
  );

  const sendPost = async () => {
    if (loading) return;
    setLoading(true);

    const docRef = await updateDoc(doc(db, "posts", postId), {
      userId: session.user.uid,
      username: session.user.name,
      userImg: session.user.image,
      tag: session.user.tag,
      text: input,
      image: selectedImage,
      timestamp: serverTimestamp(),
      edited: true,
    });
    const imageRef = ref(storage, `posts/${postId}/image`);

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, "data_url").then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "posts", postId), {
          image: downloadURL,
        });
      });
    }

    setLoading(false);
    setInput("");
    setSelectedFile(null);
    setSelectedImage(null);
    setShowEmojis(false);
    setIsEditOpen(false);
  };

  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };

  const addEmoji = (e) => {
    let sym = e.unified.split("-");
    let codesArray = [];
    sym.forEach((el) => codesArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codesArray);
    setInput(input + emoji);
  };

  return (
    <Transition.Root show={isEditOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-50 inset-0 pt-8 "
        onClose={setIsEditOpen}
      >
        <div className="flex items-start justify-center  min-h-[800px] sm:min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-[#5b7083] bg-opacity-40 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={`inline-block align-bottom bg-[#15202b]  rounded-2xl text-left 
             shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full `}
            >
              <div className="flex items-center px-1.5 py-2 border-b border-gray-700">
                <div
                  className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0"
                  onClick={() => setIsEditOpen(false)}
                >
                  <XIcon className="h-[22px] text-white" />
                </div>
              </div>
              <div
                className={`border-b border-gray-700 p-3 flex space-x-3 overflow-y-scroll scrollbar-hide ${
                  loading && "opacity-60"
                }`}
              >
                <img
                  src={session.user.image}
                  alt=""
                  className="h-11 w-11 rounded-full cursor-pointer"
                />
                <div className="w-full divide-y divide-gray-700">
                  <div
                    className={`${selectedFile && "pb-7"} ${
                      selectedImage && "pb-7"
                    } ${input && "space-y-2.5"}`}
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows="2"
                      className="bg-transparent outline-none text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px]"
                      placeholder="what's happening?"
                    />
                    {(selectedFile ? selectedFile : selectedImage) && (
                      <div className="relative">
                        <div
                          onClick={() => {
                            setSelectedFile(null);
                            setSelectedImage(null);
                          }}
                          className="absolute w-8 h-8 bg-[#141414] hover:bg-[#3a3a3a] bg-opacity-75
                        rounded-full flex items-center justify-center top-1 left-1 cursor-pointer"
                        >
                          <XIcon className="text-white h-5" />
                        </div>
                        <img
                          src={selectedFile ? selectedFile : selectedImage}
                          alt=""
                          className="rounded-2xl max-h-80 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  {!loading && (
                    <div className="flex items-center justify-between pt-2.5">
                      <div className="flex items-center">
                        <div
                          className="icon"
                          onClick={() => filePickerRef.current.click()}
                        >
                          <PhotographIcon className="h-[22px] text-[#1d9bf0]" />
                          <input
                            type="file"
                            hidden
                            onChange={addImageToPost}
                            ref={filePickerRef}
                          />
                        </div>
                        <div className="icon rotate-90">
                          <ChartBarIcon className="text-[#1d9bf0] h-[22px]" />
                        </div>

                        <div
                          className="icon"
                          onClick={() => setShowEmojis(!showEmojis)}
                        >
                          <EmojiHappyIcon className="text-[#1d9bf0] h-[22px]" />
                        </div>

                        <div className="icon">
                          <CalendarIcon className="text-[#1d9bf0] h-[22px]" />
                        </div>

                        {showEmojis && (
                          <Picker
                            onSelect={addEmoji}
                            style={{
                              position: "absolute",
                              marginTop: "465px",
                              marginLeft: -40,
                              maxWidth: "320px",
                              borderRadius: "20px",
                              backgroundColor: "#15202b",
                            }}
                            theme="dark"
                            color="#1d9bf0"
                            title=""
                            emoji=":wave:"
                            set="twitter"
                            className="scrollbar-hide"
                          />
                        )}
                      </div>
                      <button
                        className="bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold shadow-md 
            hover:bg-[#1a8cd8] disabled:hover:bg-[#1d9bf0] disabled:opacity-50 disabled:cursor-default"
                        disabled={
                          !input.trim() && !selectedFile && !selectedImage
                        }
                        onClick={sendPost}
                      >
                        Tweet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default EditModal;
