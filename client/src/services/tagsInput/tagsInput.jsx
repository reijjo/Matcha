import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { WithContext as ReactTags } from "react-tag-input";
import axiosStuff from "services/axiosstuff";

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

function useTags() {
  const [tags, setTags] = useState([]);
	const [tagSuggestions, setTagSuggestions] = useState(null)

	useEffect(() => {
		axiosStuff
		.getTag().then((response) => {
			setTagSuggestions(response.rows)
		})
	}, [])

  return {
    tags, setTags, tagSuggestions
  }
}

function Tags({ tagsReg, setTagsReg }) {
  const hook = useTags(tagsReg, setTagsReg);
  const { tags, setTags, tagSuggestions } = hook;
  // const [tags, setTags] = useState([]);
	// const [tagSuggestions, setTagSuggestions] = useState(null)

	// useEffect(() => {
	//	axiosStuff
	//	.getTag().then((response) => {
	//		setTagSuggestions(response.rows)
	//	})
	// }, [])

	let suggestions = [];
	if (tagSuggestions) {
		suggestions = tagSuggestions.map(sug => ({id:sug.tag, text:sug.tag}));
	}

  const handleDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
		setTagsReg(tags.filter((tag, index) => index !== i).map(tg => tg.text));
  };

  const handleAddition = (tag) => {
    if (tag.text.match(/^[a-z0-9]+$/) && tag.text.length < 20) {
      setTags([...tags, tag]);
      setTagsReg([...tags, tag].map(tg => tg.text));
      axiosStuff
      .addTag(tag)
      // .then((response) => {
      //	console.log('TAGILIS"YAS', response)
      // })
    }
  };

	// console.log('TAGSREG', tagsReg)

  const handleDrag = (tag, currPos, newPos) => {
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
  };

  // const handleTagClick = (index) => {
  //   // console.log(`The tag at index ${index} was clicked`);
  // };



  return (
    <div className="w-full app">
      <div className="">
        <ReactTags
          classNames={{
            tags: "tagsClass",
            tagInput: "tagInputClass w-full pt-2.5",
            tagInputField:
              "tagInputFieldClass text-coolGray-900 shadow-input w-full rounded-lg border border-indigo-900 px-4 py-2.5 text-base font-normal outline-none focus:border-indigo-900",
            // selected: "selectedClass",
            // tag: "tagClass",
            // remove: "removeClass",
            // suggestions: "suggestionsClass",
            // activeSuggestion: "activeSuggestionClass",
            // editTagInput: "editTagInputClass",
            // editTagInputField: "editTagInputField",
            // clearAll: "clearAllClass",
          }}
          id="inputId"
          name="inputName"
          tags={tags}
          suggestions={suggestions}
          delimiters={delimiters}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          handleDrag={handleDrag}
          // handleTagClick={handleTagClick}
          inputFieldPosition="bottom"
          autocomplete
          editable
        />
      </div>
    </div>
  );
}

Tags.propTypes = {
	tagsReg: PropTypes.arrayOf(PropTypes.string),
	setTagsReg: PropTypes.func,
}

Tags.defaultProps = {
	tagsReg: [],
	setTagsReg: () => {}
}

export default Tags;
