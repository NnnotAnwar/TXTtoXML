const TXTLoader = document.querySelector('#txtLoader')
const downloadBtn = document.querySelector('#download')

const createXMLDocument = () => {
    let XMLDocument = document.implementation.createDocument(null, 'books');
    const XMLString = "<root></root>"
    const parser = new DOMParser()
    XMLDocument = parser.parseFromString('<?xml version="1.0" encoding="utf-8"?><root></root>', "application/xml");
    const root = XMLDocument.getElementsByTagName("root")[0]
    let jobs = XMLDocument.createElement("jobs")
    root.appendChild(jobs)
}

TXTLoader.addEventListener('change', function (e) {
    const files = TXTLoader.files
    const file = files[0]
    const convertToXML = () => {
        let reader = new FileReader()
        reader.readAsText(file);
        reader.onload = () => {
            const text = reader.result
            createXMLDocument()
        }
    }

    if (files.length === 1 && file.type === 'text/plain') {
        console.log(file.name)
        downloadBtn.classList.remove('disabled')
        downloadBtn.removeAttribute('disabled')
        downloadBtn.addEventListener('click', convertToXML)
    } else {
        downloadBtn.classList.add('disabled')
        downloadBtn.setAttribute('disabled', 'disabled')
        downloadBtn.removeEventListener('click', convertToXML)
    }
})

