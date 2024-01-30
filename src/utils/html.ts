const copy = `
	<script>
		function copy(id) {
			// Get the content of the <p> tag
			const contentToCopy = document.getElementById(id).innerText;

			// Create a temporary textarea element
			const textarea = document.createElement('textarea');
			textarea.value = contentToCopy;

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