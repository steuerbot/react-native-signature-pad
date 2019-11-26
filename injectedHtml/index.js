export default ({
  script,
  backgroundColor = '#ffffff',
  ratio = 1,
  subtitle = '&nbsp;',
}) => `<html>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  * {
    margin:0;
    padding:0;
  }
  
  body {
    background: ${backgroundColor};
  }

  canvas {
    position:absolute;
    transform:translateZ(0);
  }
  
  #line {
    position: absolute;
    left: ${ratio * 24}px;
    right: ${ratio * 24}px;
    bottom: ${ratio * 24}px;
    border-top: ${ratio * 2}px solid #999;
    font-size: ${ratio * 12}px;
    padding: ${ratio * 8}px;
    font-family: "SF Pro Text", "Roboto", "Arial";
    color: #999;
    text-align: center;
  }

  </style>
  <body>
    <div id="line">
      ${subtitle}
    </div>
    <canvas></canvas>
    <script>${script}</script>
  </body>
</html>`;
