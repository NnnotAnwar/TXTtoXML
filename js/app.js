const TXTLoader = document.querySelector('#txtLoader')
const downloadBtn = document.querySelector('#download')

TXTLoader.addEventListener('change', function (e) {
    const files = TXTLoader.files
    const file = files[0]
    const convertToXML = () => {
        let reader = new FileReader()
        reader.readAsText(file);
        reader.onload = () => { const shit = reader.result }
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

