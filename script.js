
const video = document.getElementById('video')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVid)

async function startVid() {
  navigator.getUserMedia(
    { video: {}},
    stream => video.srcObject = stream, 
    error => console.error(error)
  )
  const faceDescriptor = await loadImage()
  const faceMatcher = new faceapi.FaceMacther(faceDescriptor, 0.6)
  video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      const res = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
      res.forEach((res, i) => {
        const box = resizedDetections[i].detection.box
        const draw = new faceapi.draw.DrawBox(box, {label: res.toString()})
        canvas = canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        //faceapi.draw.drawDetections(canvas, resizedDetections)
        draw.draw(canvas)
      })
      
    }, 100)
    console.log("done")
  })
}



function loadImage(){
  const label = ['Allan Turing', 'Ella Pingkian', 'Kiko Pangilinan', 'Leni Robredo', 'Tom Holland']
  return Promise.all(
    label.map(async label => {
      const descriptions = []
      for(let i=1; i=2; i++){
        const image = await faceapi.fetchImage('https://github.com/ellaPingkian/ITE153LAB1/tree/main/Lab%201/known/${label}/${i}.jpg')
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

