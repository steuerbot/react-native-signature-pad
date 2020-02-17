import React, {forwardRef, memo, useCallback, useEffect, useMemo, useState,} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';

import htmlContent from './injectedHtml';
import injectedSignaturePad from './injectedJavaScript/signaturePad';
import injectedApplication from './injectedJavaScript/application';

const noopFunction = () => {};

const SignaturePad = (props, ref) => {
  const {
    onError = noopFunction,
    style = {},
    subtitle = '&nbsp;',
    loader = noopFunction,
    off = false,
  } = props;

  const [size, setSize] = useState(null);
  const onLayout = useCallback(e => {
    const ratio = 1; // Math.max(PixelRatio.get(), 1);
    const { width, height } = e.nativeEvent.layout;
    const newWidth = width * ratio;
    const newHeight = height * ratio;

    setSize({
      width: newWidth,
      height: newHeight,
      // transform: [
      //   {
      //     translateX: (width - newWidth) / 2,
      //   },
      //   {
      //     translateY: (height - newHeight) / 2,
      //   },
      //   {
      //     scale: 1 / ratio,
      //   },
      // ],
    });
  }, []);

  const [started, setStarted] = useState(false);
  const start = useCallback(() => setTimeout(() => setStarted(true), 100), []);

  const backgroundColor = useMemo(
    () => StyleSheet.flatten(style).backgroundColor || '#ffffff',
    [style]
  );

  const padStyle = useMemo(
    () => ({
      ...StyleSheet.absoluteFillObject,
      backgroundColor,
      opacity: started ? 0.99 : 0,
    }),
    [style, backgroundColor, started]
  );

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
    const script = `${injectedSignaturePad};${injectedApplication(props)};true;`;
    const ratio = 1; // Math.max(PixelRatio.get(), 1);
    return {
      html: htmlContent({
        script,
        backgroundColor,
        ratio,
        subtitle,
      }),
    };
  }, [props, backgroundColor, subtitle]);

  const [webViewInstance, setWebView] = useState();

  const setRef = useCallback(
    webView => {
      setWebView(webView);
      const getExecuteFunction = (func, args = []) => {
        return () => webView.injectJavaScript(`window.${func}();true;`);
      };
      if (ref) {
        ref.current = {
          webView,
          clear: getExecuteFunction('signaturePad.clear'),
          cropData: getExecuteFunction('cropData'),
        };
      }
    },
    [ref]
  );

  useEffect(() => {
    if (!started || !webViewInstance) {
      return;
    }
    if (off) {
      webViewInstance.injectJavaScript('window.signaturePad.off();true;');
    } else {
      webViewInstance.injectJavaScript('window.signaturePad.on();true;');
    }
  }, [started, off, webViewInstance]);

  return (
    <View style={containerStyle} onLayout={onLayout}>
      {size && (
        <View style={size}>
          <WebView
            androidHardwareAccelerationDisabled
            javaScriptEnabled
            ref={setRef}
            automaticallyAdjustContentInsets={false}
            onMessage={onMessage}
            onLoadEnd={start}
            renderError={onError}
            renderLoading={loader}
            source={source}
            style={padStyle}
          />
        </View>
      )}
    </View>
  );
};

export default memo(forwardRef(SignaturePad));
