define(['text!./templates/snippet.html', 'css!./tiny.css'], function (snippet) {
	var doc, temp, dest, node;
	doc = window.document;
	temp = doc.createElement('div');
	dest = doc.documentElement;
	temp.innerHTML = snippet;
	while ((node = temp.firstChild)) {
		dest.appendChild(temp.firstChild);
	}
});
