import React, {forwardRef, memo, useCallback, useMemo, useState} from 'react';
import {PixelRatio, StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';

import htmlContent from './injectedHtml';
import injectedSignaturePad from './injectedJavaScript/signaturePad';
import injectedApplication from './injectedJavaScript/application';

const noopFunction = () => {};

const SignaturePad = (props, ref) => {
  const { onError = noopFunction, style = {} } = props;

  const [size, setSize] = useState(null);
  const onLayout = useCallback(e => {
    const ratio = Math.max(PixelRatio.get(), 1);
    const { width, height } = e.nativeEvent.layout;
    const newWidth = width * ratio;
    const newHeight = height * ratio;

    setSize({
      width: newWidth,
      height: newHeight,
      transform: [
        {
          translateX: (width - newWidth) / 2,
        },
        {
          translateY: (height - newHeight) / 2,
        },
        {
          scale: 1 / ratio,
        },
      ],
    });
  }, []);

  const [started, setStarted] = useState(false);
  const start = useCallback(() => setTimeout(() => setStarted(true), 100), []);

  const backgroundColor = useMemo(() => {
    return StyleSheet.flatten(style).backgroundColor || '#ffffff';
  }, [style]);

  const padStyle = useMemo(() => {
    return {
      ...StyleSheet.absoluteFillObject,
      backgroundColor,
      opacity: started ? 1 : 0,
    };
  }, [style, backgroundColor, started]);

  const containerStyle = useMemo(() => {
    return {
      flex: 1,
      ...style,
    };
  }, [style]);

  const onMessage = useCallback(event => {
    const { func, args } = JSON.parse(event.nativeEvent.data);
    if (props[func]) {
      props[func](...args);
    }
  }, []);

  const source = useMemo(() => {
    const script = injectedSignaturePad + injectedApplication(props);
    return {
      html: htmlContent({
        script,
        backgroundColor,
      }),
    };
  }, [props, backgroundColor]);

  const setRef = useCallback(
    webView => {
      const getExecuteFunction = (func, args = []) => {
        return () => webView.postMessage(JSON.stringify({ func, args }));
      };
      if (ref) {
        ref.current = {
          webView,
          clear: getExecuteFunction('clear'),
          cropData: getExecuteFunction('cropData'),
        };
      }
    },
    [ref]
  );

  return (
    <View style={containerStyle} onLayout={onLayout}>
      {size && (
        <View style={size}>
          <WebView
            ref={setRef}
            automaticallyAdjustContentInsets={false}
            onMessage={onMessage}
            onLoadEnd={start}
            renderError={onError}
            renderLoading={noopFunction}
            source={source}
            javaScriptEnabled={true}
            style={padStyle}
          />
        </View>
      )}
    </View>
  );
};

export default memo(forwardRef(SignaturePad));
