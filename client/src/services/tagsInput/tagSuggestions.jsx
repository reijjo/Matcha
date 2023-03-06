// const tagSuggestions = ["Food", "Hiking", "Pizza", "Wine"];

import { useState, useEffect } from "react";
import axiosStuff from "services/axiosstuff";

function useTagSuggestions() {
	const [tagSuggestions, setTagSuggestions] = useState(null)

	useEffect(() => {
		axiosStuff
		.getTag().then((response) => {
			setTagSuggestions(response)
			// console.log('HAETUT TAGIT', response)
		})
	})

	return tagSuggestions;
}

export default useTagSuggestions;

// const suggestions = [
//   { id: "1", name: "mango" },
//   { id: "2", name: "pineapple" },
//   { id: "3", name: "orange" },
//   { id: "4", name: "pear" },
// ];

// export default suggestions;
