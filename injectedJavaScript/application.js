export default ({
  penColor = '#000000',
  dataURL = null,
  minWidth = 1,
  maxWidth = 2,
  dotSize = 2,
  minDistance = 1,
}) => `
  const send = function(obj) {
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  };

  window.onerror = function(message, url, line, column, error) {
    send({
      func: 'onError',
      args: [{
        message: message,
        url: url,
        line: line,
        column: column,
        error: error,
      }],
    });
  };
  
  var bodyWidth = document.body.clientWidth || window.innerWidth;
  var bodyHeight = document.body.clientHeight || window.innerHeight;
  var signaturePadCanvas = document.querySelector('canvas');
  
  signaturePadCanvas.width = bodyWidth;
  signaturePadCanvas.height = bodyHeight;
  
  window.signaturePad = new SignaturePad(signaturePadCanvas, {
    penColor: '${penColor}',
    dotSize: window.devicePixelRatio * ${dotSize},
    minWidth: window.devicePixelRatio * ${minWidth},
    maxWidth: window.devicePixelRatio * ${maxWidth},
    minDistance: window.devicePixelRatio * ${minDistance},
    onBegin: function() {
      send({
        func: 'onBegin',
        args: [],
      });
    },
    onEnd: function() {
      send({
        func: 'onChange',
        args: [window.signaturePad.toDataURL()],
      });
    }
  });
  ${dataURL ? `window.signaturePad.fromDataURL('${dataURL}');` : ''}
  
  var cropData = function() {
    var imgWidth = signaturePadCanvas.width;
    var imgHeight = signaturePadCanvas.height;
    var imageData = signaturePadCanvas.getContext("2d").getImageData(0, 0, imgWidth, imgHeight);
    var data = imageData.data;
    
    var getAlpha = function(x, y) {
      return data[(imgWidth*y + x) * 4 + 3]
    };
    var scan = function() {
      var xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
      var filledPixel = 0;
      var filledWidth = 0;
      var filledHeight = 0;
      
      for(var x = 0; x < imgWidth; x++) {
        // loop through each row
        for(var y = 0; y < imgHeight; y++) {
          if (getAlpha(x, y)) {
            filledPixel++;
            if(x < xMin) {
              xMin = x;
            }
            if(x > xMax) {
              xMax = x;
            }          
            if(y < yMin) {
              yMin = y;
            }
            if(y > yMax) {
              yMax = y;
            }       
          }      
        }
      }
      if(filledPixel) {
        filledWidth = xMax-xMin+1;
        filledHeight = yMax-yMin+1;
      }
      
      return {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax,
        width: filledWidth,
        height: filledHeight,
        fillRateAbsolute: filledPixel / (imgWidth*imgHeight),
        fillRateRelative: filledPixel ? filledPixel / (filledWidth*filledHeight) : 0,
        fillAreaRate: (filledWidth*filledHeight) / (imgWidth*imgHeight),
      };
    };

    var crop = scan();
    crop.data = null;
    
    if(!crop.fillRateAbsolute) {
      send({
        func: 'onDataCropped',
        args: [crop],
      });
      return null;
    }

    var relevantData = signaturePadCanvas.getContext("2d").getImageData(crop.xMin, crop.yMin, crop.width, crop.height);
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = crop.width;
    tempCanvas.height = crop.height;
    tempCanvas.getContext("2d").putImageData(relevantData, 0, 0);
    
    var result = tempCanvas.toDataURL('image/png');
    
    crop.data = result;
    send({
      func: 'onDataCropped',
      args: [crop],
    });
    return null;
  }
`;
