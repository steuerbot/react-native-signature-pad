import React, {forwardRef, memo, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

import htmlContent from './injectedHtml';
import injectedSignaturePad from './injectedJavaScript/signaturePad';
import injectedApplication from './injectedJavaScript/application';

const noopFunction = () => {};

const SignaturePad = (props, ref) => {
  const { onError = noopFunction, onStart = noopFunction, style = {} } = props;

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
        backgroundColor: StyleSheet.flatten(style).backgroundColor,
      }),
    };
  }, [props]);

  const setRef = useCallback(
    webView => {
      const getExecuteFunction = (func, args = []) => {
        return () => webView.postMessage(JSON.stringify({ func, args }));
      };
      if (ref) {
        ref.current = {
          webView,
          clear: getExecuteFunction('clear'),
        };
      }
    },
    [ref]
  );

  return (
    <WebView
      ref={setRef}
      automaticallyAdjustContentInsets={false}
      onMessage={onMessage}
      onLoadEnd={onStart}
      renderError={onError}
      renderLoading={noopFunction}
      source={source}
      javaScriptEnabled={true}
      style={style}
    />
  );
};

export default memo(forwardRef(SignaturePad));
