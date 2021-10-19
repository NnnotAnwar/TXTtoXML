// добавление на документ слушатель события с функцией конвертера, когда DOM-дерево будет загружено
document.addEventListener('DOMContentLoaded', TXTtoXMLConverter)

// функция конвертер
function TXTtoXMLConverter() {
    // опредение нужных нам элементов из DOM-дерева и помещение их в соответсвующие переменные
    const TXTLoader = document.querySelector('#txtLoader')
    const convertBtn = document.querySelector('#convert')
    const textArea = document.querySelector('#convertedFile')

    // функция для форматирования XML DOM - добавляет отступы, табуляции для элементов дерева
    // возвращает отформатированный String XML DOM unminify
    const xmlFormatter = (xml) => {
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

    // функция создание XML документа
    const createXMLDocument = () => {
        // создание XMLDocument
        XMLDoc = document.implementation.createDocument(null, 'books');
        // создание парсера DOM-дерева XML
        const parser = new DOMParser()
        // парсинг <?xml version="1.0" encoding="utf-8"?><root></root> в документ
        XMLDoc = parser.parseFromString('<?xml version="1.0" encoding="utf-8"?><root></root>', "application/xml");
    }

    // создание слушателя для загрузчика файлов, при загрузке файла
    TXTLoader.addEventListener('change', function () {
        const files = TXTLoader.files
        const file = files[0]
        const convertToXML = () => {
            // чтение файла в виде текста
            let reader = new FileReader()
            reader.readAsText(file);
            reader.onload = () => {
                // создание XMLDocument
                createXMLDocument()
                // помещение результата прочтенного файла в переменную text
                const text = reader.result
                // создание регулярных выражении для опредения нужных нам строк в будущем
                const regTitle = /.+/g
                const regJobTitle = /[№#]\d.+/g
                const regJobDescription = /^[Хх].+работ[\.\s,:-]/gm
                const regJobHaveToKnow = /^[Дд].+знать[\.\s,:-]/gm
                const regJobAddition = /^[Пп].+ни[ея][\.\s,:-]/gm
                const regJobSubDescription = /^[Хх].+работ[\.\s,:-]\B.*\n*/gm
                const regJobSubHaveToKnow = /^[Дд].+знать[\.\s,:-]\B.*\n*/gm
                const regJobSubAddition = /^[Пп].+ни[ея][\.\s,:-]\B.*\n*/gm
                // создание элемента заголовка, работ в XMLDocument
                const title = XMLDoc.createElement("title")
                const jobs = XMLDoc.createElement("jobs")
                // опредение корневого элемента в XMLDocument
                const root = XMLDoc.getElementsByTagName('root')[0]
                // внедрение заголовка и элемента работы в документ
                root.appendChild(title)
                root.appendChild(jobs)
                // с помощью регулярного выражение опредение заголовка в тексте и помещение его в элемент заголовка в документ
                title.innerHTML = text.match(regTitle)[0]

                // конструкция цикла, для каждого найденого заголовка работы, создать элемент работа, создать элемент заголовок-работы, и поместить элементы в элемент работы, поместив в работу заголовок работы 
                for (const item of text.match(regJobTitle)) {
                    job = XMLDoc.createElement("job")
                    const jobTitle = XMLDoc.createElement("job-title")
                    jobs.appendChild(job)
                    jobTitle.innerHTML = item
                    job.appendChild(jobTitle)
                }

                // для каждого найденого элемента в работы создать элементы характеристика работ, должен знать, примечание и поместить их в найденные элементы
                for (const item of jobs.childNodes) {
                    jobDescription = XMLDoc.createElement("job-description")
                    jobHaveToKnow = XMLDoc.createElement("job-have-to-know")
                    jobAddition = XMLDoc.createElement("job-addition")
                    item.appendChild(jobDescription)
                    item.appendChild(jobHaveToKnow)
                    item.appendChild(jobAddition)
                }
                // опредение созданных элементов
                jobDesc = XMLDoc.getElementsByTagName("job-description")
                jobHaveToKnow = XMLDoc.getElementsByTagName("job-have-to-know")
                jobAddition = XMLDoc.getElementsByTagName("job-addition")

                for (let i = 0; i < jobDesc.length; i++) {

                    // проверка на наличие строки Характеристика работ
                    if (text.match(regJobDescription)[i] !== undefined) {
                        if (text.match(regJobDescription)[i] !== null) {
                            // помещение найденной строки в заголовок характеристики
                            jobDesc[i].innerHTML = `<job-description-title>${text.match(regJobDescription)[i]}</job-description-title>`
                            // помещение указателя "Характеристка не указана", при отсутвии строки(провал проверки)
                        } else jobDesc[i].innerHTML = 'Характеристка не указана.'
                    } else jobDesc[i].innerHTML = 'Характеристка не указана.'
                    // проверка на наличие строк после строки Характеристика работ
                    if (text.match(regJobSubDescription)[i] !== undefined) {
                        if (text.match(regJobSubDescription)[i] !== null) {
                            // удаление Характеристика работ из найденного совпадение(возвращается ["", "нужная нам строка"])
                            // помещение нужной строки в переменную и включение его в документ после заголовка Характеристики
                            jobSubDesc = text.match(regJobSubDescription)[i].split(/[Хх].+работ[\.\s,:-]/gi)[1]
                            const subJobDesc = XMLDoc.createElement('job-subdescription')
                            subJobDesc.innerHTML = jobSubDesc
                            jobDesc[i].appendChild(subJobDesc)
                        }
                    }

                    // проверка на наличие строки Должен знать(проверки в процессе оптимизации)
                    if (text.match(regJobHaveToKnow) !== undefined) {
                        if (text.match(regJobHaveToKnow) !== null) {
                            if (text.match(regJobHaveToKnow)[i] !== undefined) {
                                if (text.match(regJobHaveToKnow)[i] !== null) {
                                    // помещение строки в элемент заголовка
                                    jobHaveToKnow[i].innerHTML = `<job-have-to-know-title>${text.match(regJobHaveToKnow)[i]}</job-have-to-know-title>`
                                    // помещение указателя 'Не указаны необходимые знания', при отсутствии строки(провал проверки)
                                } else jobHaveToKnow[i].innerHTML = 'Не указаны необходимые знания'
                            } else jobHaveToKnow[i].innerHTML = 'Не указаны необходимые знания'
                        } else jobHaveToKnow[i].innerHTML = 'Не указаны необходимые знания'
                    } else jobHaveToKnow[i].innerHTML = 'Не указаны необходимые знания'

                    // проверка на наличие строк после строки Должен знать
                    if (text.match(regJobSubHaveToKnow) !== undefined) {
                        if (text.match(regJobSubHaveToKnow) !== null) {
                            if (text.match(regJobSubHaveToKnow)[i] !== undefined) {
                                if (text.match(regJobSubHaveToKnow)[i] !== null) {
                                    // удаление Должен знать из найденного совпадение(возвращается ["", "нужная нам строка"])
                                    // помещение нужной строки в переменную и включение его в документ после заголовка Должен знать
                                    jobSubHaveToKnow = text.match(regJobSubHaveToKnow)[i].split(/^[Дд].+знать[\.\s,:-]/gi)[1]
                                    const subJobHaveToKnow = XMLDoc.createElement('job-have-to-know-sub')
                                    subJobHaveToKnow.innerHTML = jobSubHaveToKnow
                                    jobHaveToKnow[i].appendChild(subJobHaveToKnow)
                                }
                            }
                        }
                    }

                    // похожий код
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

                // помещение результата в главный документ в поле textarea, перед этим отформатировав его c помощью функции xmlFormatter() (unminify)
                convertedFile.innerHTML = xmlFormatter(root.outerHTML)
            }
        }

        // проверка на совпадение файлового формата с text/plain(.txt) и количество загруженных файлов
        if (files.length === 1 && file.type === 'text/plain') {
            // вывод названия файла в консоль, создание слушателя событии для кнопки, удаление аттрибута disabled, и класса disabled
            console.log(file.name)
            convertBtn.addEventListener('click', convertToXML)
            convertBtn.removeAttribute('disabled')
            convertBtn.classList.remove('disabled')
        } else {
            // если файл не совпадает, удаление слушателя событии у кнопки, добавление аттрибута disabled, и класса disabled
            convertBtn.removeEventListener('click', convertToXML)
            convertBtn.setAttribute('disabled', 'disabled')
            convertBtn.classList.add('disabled')
        }
    })
}