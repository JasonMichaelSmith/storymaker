const copy = `
	<script>
		function copy(id) {
			// Get the content of the <p> tag
			const contentToCopy = document.getElementById(id);

			// Set the opacity to indicate we've copied this content
			contentToCopy.style.opacity = 0.25;

			// Create a temporary textarea element
			const textarea = document.createElement('textarea');
			textarea.value = contentToCopy.innerText;

			// Append the textarea to the document
			document.body.appendChild(textarea);

			// Select the content of the textarea
			textarea.select();

			// Copy the selected content to the clipboard
			document.execCommand('copy');

			// Remove the temporary textarea
			document.body.removeChild(textarea);
		}
	</script>
`;

export const func = { copy };