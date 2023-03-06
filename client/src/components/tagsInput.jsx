import { useState } from "react";

function TagsInput() {
  const [tags, setTags] = useState([]);

  function handleKeyDown(e) {
    // If user did not press enter key, return
    if (e.key !== "Enter") return;
    // Get the value of the input
    const { value } = e.target;
    // If the value is empty, return
    if (!value.trim()) return;
    // Add the value to the tags array
    setTags([...tags, value]);
    // Clear the input
    e.target.value = "";
  }

  function removeTag(index) {
    setTags(tags.filter((el, i) => i !== index));
  }

  return (
    // <div className="w-full p-3 tags-input-container md:flex-1">
    //   {tags.map((tag, index) => (
    //     <div className="m-2 tag-item" key={index}>
    //       {/* One hardcoded tag for test */}
    //       <span className="text">{tag}</span>
    //       <span className="close" onClick={() => removeTag(index)}>
    //         &times;
    //       </span>
    //     </div>
    //   ))}
    //   <div className="w-full pt-3">
    //     <input
    //       onKeyDown={handleKeyDown}
    //       type="text"
    //       className="tags-input text-coolGray-900 shadow-input w-full rounded-lg border border-indigo-900 px-4 py-2.5 text-base font-normal outline-none focus:border-green-500"
    //       placeholder="Press enter to add a tag"
    //     />
    //   </div>
    // </div>
	 <div>jo</div>

  );
}

export default TagsInput;
