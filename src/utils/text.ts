/**
 * Transforms headings into the signature uppercase-extra-spaces format (note that 3 spaces between words is required for optimal reading).
 * 
 * @note This won't work for periods that need to be stuck to the letters like with initials.
 */
export function transformHeading(input: string): string {
	return input
		.toUpperCase()
		.split('')
		.join(' ')
		.replace(/\*/g, '')
		.replace(/\ \^/g, '') // replace " ^" with ""
		.replace(/\ \./g, '.'); // replace " ." with ""
}