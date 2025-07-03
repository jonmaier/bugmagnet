async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    // Do something with the pasted text, e.g., insert into a textarea
    console.log(text);
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err);
  }
}

pasteFromClipboard();