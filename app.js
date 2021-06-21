// global selection and var
const colorDivs = document.querySelectorAll('.color')
const generateBtn = document.querySelector('.generate')
const sliders = document.querySelectorAll('input[type="range"]')
const currentHexes = document.querySelectorAll('.color h2')
const popup = document.querySelector('.copy-container')
const adjustButton = document.querySelectorAll('.adjust')
const closeAdjustments = document.querySelectorAll('.close-adjustement')
const sliderContainer = document.querySelectorAll('.sliders')
const lockButton = document.querySelectorAll('.lock')

let initialColor

let savedPalettes = []

// Functions
const generateHex = () => {
    const hexColor = chroma.random()
        return hexColor
}

// Color generator
const randomColors = () => {
    initialColor = []

    colorDivs.forEach(div => {
        const hexText = div.children[0]
        const randomColor = generateHex()

        if (div.classList.contains('locked')) {
            initialColor.push(hexText.innerText)
            return
        } else {
            initialColor.push(chroma(randomColor).hex())
        }

        // Add color to the bckgrnd
        div.style.backgroundColor = randomColor
        hexText.innerText = randomColor

        checkTextContrast(randomColor, hexText)

        // Init colorize sliders
        const color = chroma(randomColor)
        const sliders = div.querySelectorAll('.sliders input')
        const hue = sliders[0]
        const brightness = sliders[1]
        const saturation = sliders[2]

        colorizeSliders(color, hue, brightness, saturation)
    })
    // Reset Input
    resetInput()

    // Check for button contrast
    adjustButton.forEach((button, index) => {
        checkTextContrast(initialColor[index], button)
        checkTextContrast(initialColor[index], lockButton[index])
    })
    
}

const checkTextContrast = (color, text) => {
    const luminance = chroma(color).luminance()

    if (luminance > 0.5) {
        text.style.color = 'black'
    } else {
        text.style.color = 'white'
    }
}

const colorizeSliders = (color, hue, brightness, saturation) => {
    // Scale sat
    const noSat = color.set('hsl.s', 0)
    const fullSat = color.set('hsl.s', 1)
    const scaleSat = chroma.scale([noSat, color, fullSat])

    // Scale brightness
    const midBright = color.set('hsl.l', 0.5)
    const scaleBright = chroma.scale(['black', midBright, 'white'])


    // Update input color 
    saturation.style.backgroundImage = `
        linear-gradient(to right,
            ${scaleSat(0)}, 
            ${scaleSat(1)})`

    brightness.style.backgroundImage = `
        linear-gradient(to right,
            ${scaleBright(0)}, 
            ${scaleBright(0.5)},  
            ${scaleBright(1)})`

        hue.style.backgroundImage = `
        linear-gradient(to right, rgb(204, 75, 75), 
        rgb(204, 204, 75), rgb(75, 204, 75), 
        rgb(75, 204, 204), rgb(75, 75, 204), 
        rgb(204, 75, 204), rgb(204, 75, 75))`
}

const hslControls = e => {
    const index = 
    e.target.getAttribute('data-bright') ||
    e.target.getAttribute('data-sat') ||
    e.target.getAttribute('data-hue')  

    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]')
    const hue = sliders[0]
    const brightness = sliders[1]
    const saturation = sliders[2]

    const bgColor = initialColor[index]

    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value)

    colorDivs[index].style.backgroundColor = color

    // Colorize sliders
    colorizeSliders(color, hue, brightness, saturation)
}

const updateTextUI = index => {
    const activeDiv = colorDivs[index]
    const color = chroma(activeDiv.style.backgroundColor)
    const textHex = activeDiv.querySelector('h2')
    const icons = activeDiv.querySelectorAll('button')

    textHex.innerText = color.hex()

    // Check contrast
    checkTextContrast(color, textHex)
    for (icon of icons) {
        checkTextContrast(color, icon)
    }
}

const resetInput = () => {
    const sliders = document.querySelectorAll('.sliders input')

    sliders.forEach(slider => {
        if (slider.name === 'hue') {
            const hueColor = initialColor[slider.getAttribute('data-hue')]
            const hueValue = chroma(hueColor).hsl()[0]
            
            slider.value = Math.floor(hueValue)
        }
        if (slider.name === 'brightness') {
            const brightColor = initialColor[slider.getAttribute('data-bright')]
            const brightValue = chroma(brightColor).hsl()[2]

            slider.value = Math.floor(brightValue * 100) / 100
        }
        if (slider.name === 'saturation') {
            const satColor = initialColor[slider.getAttribute('data-sat')]
            const satValue = chroma(satColor).hsl()[1]

            slider.value = Math.floor(satValue * 100) / 100
        }
    })
}

const copyToClipboard = hex => {
    const el = document.createElement('textarea')
    el.value = hex.innerText
    document.body.appendChild(el)

    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)

    // Popup animation
    const popupBox = popup.children[0]
    popup.classList.add('active')
    popupBox.classList.add('active')
}

const openAdjustmentPanel = index => {
    sliderContainer[index].classList.toggle('active')
}

const closeAdjustmentPanel = index => {
    sliderContainer[index].classList.remove('active')
}

const lockFeatures = (e, index) => {
    colorDivs[index].classList.toggle('locked')
    if (colorDivs[index].classList.contains('locked')) {
        e.target.innerHTML = `<i class="fas fa-lock"></i>`
    }
    else {
        e.target.innerHTML = `<i class="fas fa-lock-open"></i>`
    }
}

// Event Listeners

sliders.forEach(slider => {
    slider.addEventListener('input', hslControls)
})

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index)
    })
})

currentHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex)
    })
})

popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0]
    popup.classList.remove('active')
    popupBox.classList.remove('active')
})

adjustButton.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index)
    })
})

closeAdjustments.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index)
    })
})

lockButton.forEach((button, index) => {
    button.addEventListener('click', e => {
        lockFeatures(e, index)
    })
})

generateBtn.addEventListener('click', randomColors)

// Implemente save to palette color and LOCAL STORAGE
const savedButton = document.querySelector('.save')
const submitSave = document.querySelector('.submit-save')
const closeSave = document.querySelector('.close-save')
const saveContainer = document.querySelector('.save-container')
const saveInput = document.querySelector('.save-container input')
const libraryContainer = document.querySelector('.library-container')
const libraryBtn = document.querySelector('.library')
const closeLibraryButton = document.querySelector('.close-library')

const openPalette = () => {
    const popup = saveContainer.children[0]
    saveContainer.classList.add('active')
    popup.classList.add('active')
}

const closePalette = () => {
    const popup = saveContainer.children[0]
    saveContainer.classList.remove('active')
    popup.classList.remove('active')
}

const savePalette = () => {
    saveContainer.classList.remove('active')
    popup.classList.remove('active')
    const name = saveInput.value
    const colors = []

    currentHexes.forEach(hex => {
        colors.push(hex.innerText)
    })

    // Generate object
    let paletteNr = savedPalettes.length

    const paletteObj = { name, colors, nr: paletteNr }
    savedPalettes.push(paletteObj)

    // Save to local storage
    saveToLocalStorage(paletteObj)
    saveInput.value = ''

    // Generate the palette for the library
    const palette = document.createElement('div')
    palette.classList.add('custom-palette')
    const title = document.createElement('h4')
    title.innerText = paletteObj.name
    const preview = document.createElement('div')
    preview.classList.add('small-preview')
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div')
        smallDiv.style.backgroundColor = smallColor
        preview.appendChild(smallDiv)
    })
    const paletteBtn = document.createElement('button')
    paletteBtn.classList.add('pick-palette-button')
    paletteBtn.classList.add(paletteObj.nr)
    paletteBtn.innerText = 'Select'

    // Append to library
    palette.appendChild(title)
    palette.appendChild(preview)
    palette.appendChild(paletteBtn)
    libraryContainer.children[0].appendChild(palette)
}

const saveToLocalStorage = paletteObj => {
    let localPalettes

    if (localStorage.getItem('palettes') === null) {
        localPalettes = []
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'))
    }

    localPalettes.push(paletteObj)
    localStorage.setItem('palettes', JSON.stringify(localPalettes))
}

const openLibrary = () => {
    const popup = libraryContainer.children[0]
    libraryContainer.classList.add('active')
    popup.classList.add('active')
}

const closeLibrary = () => {
    const popup = libraryContainer.children[0]
    libraryContainer.classList.remove('active')
    popup.classList.remove('active')
}

savedButton.addEventListener('click', openPalette)
closeSave.addEventListener('click', closePalette)
submitSave.addEventListener("click", savePalette)
libraryBtn.addEventListener('click', openLibrary)
closeLibraryButton.addEventListener('click', closeLibrary)

randomColors()

/*
const findHex = () => {
    const letters = '#123456789ABCDEF'
    let hash = '#'
    for (let i = 0; i < 6; i++) {
        hash += letters[Math.floor(Math.random() * 16)]
    }
    return hash
}
*/
