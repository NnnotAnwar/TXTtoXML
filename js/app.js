document.addEventListener('DOMContentLoaded', TXTtoXMLConverter)
function xmlFormatter(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    $.each(xml.split('\r\n'), function (index, node) {
        var indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
}

function TXTtoXMLConverter() {
    const TXTLoader = document.querySelector('#txtLoader')
    const downloadBtn = document.querySelector('#download')
    const textArea = document.querySelector('#convertedFile')

    const createXMLDocument = () => {

        XMLDoc = document.implementation.createDocument(null, 'books');
        const parser = new DOMParser()
        XMLDoc = parser.parseFromString('<?xml version="1.0" encoding="utf-8"?><root></root>', "application/xml");
    }

    TXTLoader.addEventListener('change', function (e) {
        const files = TXTLoader.files
        const file = files[0]
        XMLDoc = null
        const convertToXML = () => {
            let reader = new FileReader()
            reader.readAsText(file);
            reader.onload = () => {
                createXMLDocument()
                const text = reader.result
                const regTitle = /.+/g
                const regJobTitle = /[№#]\d.+/g
                const regJobDescription = /^[Хх].+работ[\.\s,:-]/gm
                const regJobHaveToKnow = /^[Дд].+знать[\.\s,:-]/gm
                const regJobAddition = /^[Пп].+ни[ея][\.\s,:-]/gm
                const regJobSubDescription = /^[Хх].+работ[\.\s,:-]\B.*\n*/gm
                const regJobSubHaveToKnow = /^[Дд].+знать[\.\s,:-]\B.*\n*/gm
                const regJobSubAddition = /^[Пп].+ни[ея][\.\s,:-]\B.*\n*/gm
                const title = XMLDoc.createElement("title")
                const jobs = XMLDoc.createElement("jobs")
                const root = XMLDoc.getElementsByTagName('root')[0]
                root.appendChild(title)
                root.appendChild(jobs)
                title.innerHTML = text.match(regTitle)[0]

                for (const item of text.match(regJobTitle)) {
                    job = XMLDoc.createElement("job")
                    const jobTitle = XMLDoc.createElement("job-title")
                    jobs.appendChild(job)
                    jobTitle.innerHTML = item
                    job.appendChild(jobTitle)
                }

                for (const item of jobs.childNodes) {
                    jobDescription = XMLDoc.createElement("job-description")
                    jobHaveToKnow = XMLDoc.createElement("job-have-to-know")
                    jobAddition = XMLDoc.createElement("job-addition")
                    item.appendChild(jobDescription)
                    item.appendChild(jobHaveToKnow)
                    item.appendChild(jobAddition)
                }
                jobDesc = XMLDoc.getElementsByTagName("job-description")
                jobHaveToKnow = XMLDoc.getElementsByTagName("job-have-to-know")
                jobAddition = XMLDoc.getElementsByTagName("job-addition")


                for (let i = 0; i < jobDesc.length; i++) {
                    if (text.match(regJobDescription)[i] !== undefined) {
                        if (text.match(regJobDescription)[i] !== null) {
                            jobDesc[i].innerHTML = `<job-description-title>${text.match(regJobDescription)[i]}</job-description-title>`
                        } else jobDesc[i].innerHTML = 'Характеристка не указана.'
                    } else jobDesc[i].innerHTML = 'Характеристка не указана.'
                    if (text.match(regJobSubDescription)[i] !== undefined) {
                        if (text.match(regJobSubDescription)[i] !== null) {
                            jobSubDesc = text.match(regJobSubDescription)[i].split(/[Хх].+работ[\.\s,:-]/gi)[1]
                            const subJobDesc = XMLDoc.createElement('job-subdescription')
                            subJobDesc.innerHTML = jobSubDesc
                            jobDesc[i].appendChild(subJobDesc)
                        }
                    }


                    if (text.match(regJobHaveToKnow) !== undefined) {
                        if (text.match(regJobHaveToKnow) !== null) {
                            if (text.match(regJobHaveToKnow)[i] !== undefined) {
                                if (text.match(regJobHaveToKnow)[i] !== null) {
                                    jobHaveToKnow[i].innerHTML = `<job-have-to-know-title>${text.match(regJobHaveToKnow)[i]}</job-have-to-know-title>`
                                } else jobHaveToKnow[i].innerHTML = 'Не указаны необходимые знания'
                            } else jobHaveToKnow[i].innerHTML = 'Не указаны необходимые знания'
                        } else jobHaveToKnow[i].innerHTML = 'Не указаны необходимые знания'
                    } else jobHaveToKnow[i].innerHTML = 'Не указаны необходимые знания'

                    if (text.match(regJobSubHaveToKnow) !== undefined) {
                        if (text.match(regJobSubHaveToKnow) !== null) {
                            if (text.match(regJobSubHaveToKnow)[i] !== undefined) {
                                if (text.match(regJobSubHaveToKnow)[i] !== null) {
                                    jobSubHaveToKnow = text.match(regJobSubHaveToKnow)[i].split(/^[Дд].+знать[\.\s,:-]/gi)[1]
                                    const subJobHaveToKnow = XMLDoc.createElement('job-have-to-know-sub')
                                    subJobHaveToKnow.innerHTML = jobSubHaveToKnow
                                    jobHaveToKnow[i].appendChild(subJobHaveToKnow)
                                }
                            }
                        }
                    }

                    if (text.match(regJobAddition) !== undefined) {
                        if (text.match(regJobAddition) !== null) {
                            if (text.match(regJobAddition)[i] !== undefined) {
                                if (text.match(regJobAddition)[i] !== null) {
                                    jobAddition[i].innerHTML = `<job-addition-title>${text.match(regJobAddition)[i]}</job-addition-title>`
                                } else jobAddition[i].innerHTML = 'Не указано примечание'
                            } else jobAddition[i].innerHTML = 'Не указано примечание'
                        } else jobAddition[i].innerHTML = 'Не указано примечание'
                    } else jobAddition[i].innerHTML = 'Не указано примечание'

                    if (text.match(regJobSubAddition) !== undefined) {
                        if (text.match(regJobSubAddition) !== null) {
                            if (text.match(regJobSubAddition)[i] !== undefined) {
                                if (text.match(regJobSubAddition)[i] !== null) {
                                    jobSubAddition = text.match(regJobSubAddition)[i].split(/^[Пп].+ни[ея][\.\s,:-]/gi)[1]
                                    const subJobAddition = XMLDoc.createElement('job-addition-sub')
                                    subJobAddition.innerHTML = jobSubAddition
                                    jobAddition[i].appendChild(subJobAddition)
                                }
                            }
                        }
                    }
                }
                // console.log(root.childNodes)


                convertedFile.innerHTML = xmlFormatter(root.outerHTML)
            }
        }

        if (files.length === 1 && file.type === 'text/plain') {
            console.log(file.name)
            downloadBtn.addEventListener('click', convertToXML)
            downloadBtn.removeAttribute('disabled')
            downloadBtn.classList.remove('disabled')
        } else {
            downloadBtn.removeEventListener('click', convertToXML)
            downloadBtn.setAttribute('disabled', 'disabled')
            downloadBtn.classList.add('disabled')
        }
    })
}