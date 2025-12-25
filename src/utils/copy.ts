export const handleCopy = (text: string, id: string, setCopiedId: (val: string | null) => void) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
};
