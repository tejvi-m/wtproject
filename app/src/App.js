import React, { Component } from "react";
import './App.css';


class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {file: '',imagePreviewUrl: ''};
  }

  resizeCanvasImage(img, canvas, maxWidth, maxHeight) {
      var imgWidth = img.width, 
          imgHeight = img.height;

      var ratio = 1, ratio1 = 1, ratio2 = 1;
      ratio1 = maxWidth / imgWidth;
      ratio2 = maxHeight / imgHeight;

      // Use the smallest ratio that the image best fit into the maxWidth x maxHeight box.
      if (ratio1 < ratio2) {
          ratio = ratio1;
      }
      else {
          ratio = ratio2;
      }

      var canvasContext = canvas.getContext("2d");
      var canvasCopy = document.createElement("canvas");
      var copyContext = canvasCopy.getContext("2d");
      var canvasCopy2 = document.createElement("canvas");
      var copyContext2 = canvasCopy2.getContext("2d");
      canvasCopy.width = imgWidth;
      canvasCopy.height = imgHeight;  
      copyContext.drawImage(img, 0, 0);

      // init
      canvasCopy2.width = imgWidth;
      canvasCopy2.height = imgHeight;        
      copyContext2.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvasCopy2.width, canvasCopy2.height);


      var rounds = 2;
      var roundRatio = ratio * rounds;
      for (var i = 1; i <= rounds; i++) {
          console.log("Step: "+i);

          // tmp
          canvasCopy.width = imgWidth * roundRatio / i;
          canvasCopy.height = imgHeight * roundRatio / i;

          copyContext.drawImage(canvasCopy2, 0, 0, canvasCopy2.width, canvasCopy2.height, 0, 0, canvasCopy.width, canvasCopy.height);

          // copy back
          canvasCopy2.width = imgWidth * roundRatio / i;
          canvasCopy2.height = imgHeight * roundRatio / i;
          copyContext2.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvasCopy2.width, canvasCopy2.height);

      } // end for


      // copy back to canvas
      canvas.width = imgWidth * roundRatio / rounds;
      canvas.height = imgHeight * roundRatio / rounds;
      canvasContext.drawImage(canvasCopy2, 0, 0, canvasCopy2.width, canvasCopy2.height, 0, 0, canvas.width, canvas.height);


  }

  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }
  _complete(e){
    e.preventDefault();
    var canvasPapa = document.getElementById("container").firstChild.firstChild;
    var oldCanvas = canvasPapa.childNodes[1];
    var b64 = oldCanvas.toDataURL("image/png");
    var file = this.dataURLtoFile(b64, 'mask.png');
    
    const data = new FormData();
    data.append('file', file);
    data.append('filename', "mask.png");

    fetch('http://0.0.0.0:5000/upload', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ imageURL: `http://localhost:8000/${body.file}` });
      });
    });
    
  }

  renderTheImage(){
    var uploadedImage = document.getElementsByClassName("imgPreview")[0].firstChild;

    var canvasPapa = document.getElementById("container").firstChild.firstChild;
    var oldCanvas = canvasPapa.firstChild;

    var newCanvas = document.createElement("canvas");
    newCanvas.id = "myCanv";
    const computedStyle = window.getComputedStyle(oldCanvas);
    Array.from(computedStyle).forEach(key => newCanvas.style.setProperty(key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key)));
    
    newCanvas.style.setProperty("height", uploadedImage.height);
    newCanvas.style.setProperty("width", uploadedImage.width);
    
    this.resizeCanvasImage(uploadedImage, newCanvas, uploadedImage.width, uploadedImage.height);
    // console.log(uploadedImage.width);
    canvasPapa.removeChild(canvasPapa.childNodes[0]);
    canvasPapa.appendChild(newCanvas);
    canvasPapa.appendChild(oldCanvas);
  }

  _handleSubmit(e) {
    e.preventDefault();
    // TODO: do something with -> this.state.file
    console.log('handle uploading-', this.state.file);
    this.renderTheImage();
    // console.log("hi", a);
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    const data = new FormData();
    data.append('file', file);
    data.append('filename', "gen.png");

    fetch('http://0.0.0.0:5000/upload', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ imageURL: `http://localhost:8000/${body.file}` });
      });
    });


    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />);
    } else {
      $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }

    return (
      <div className="previewComponent">
        <form onSubmit={(e)=>this._handleSubmit(e)}>
          <input className="fileInput"
            type="file"
            onChange={(e)=>this._handleImageChange(e)} />
          <button className="submitButton"
            type="submit"
            onClick={(e)=>this._handleSubmit(e)}>Upload Image</button>
        </form>
        <div className="imgPreview">
          {$imagePreview}
        </div>
        <button type = "button" onClick = {(e)=>this._complete(e)}>Inpaint the image</button>
      </div>
    )
  }
}

export default Upload
