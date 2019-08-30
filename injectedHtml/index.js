export default ({script, backgroundColor = '#ffffff'}) =>
  `<html>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    * {
      margin:0;
      padding:0;
    }
    
    body {
        backgroundColor: ${backgroundColor}
    }

    canvas {
      position:absolute;
      transform:translateZ(0);
    }

    </style>
    <body>
      <canvas></canvas>
      <script>${script}</script>
    </body>
  </html>`;
