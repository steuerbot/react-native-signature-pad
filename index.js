import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

import htmlContent from './injectedHtml';
import injectedSignaturePad from './injectedJavaScript/signaturePad';
import injectedApplication from './injectedJavaScript/application';

const noopFunction = () => {};

const SignaturePad = props => {
  const { onError = noopFunction, style = {} } = props;

  const onMessage = useCallback(event => {
    const { func, args } = JSON.parse(event.nativeEvent.data);
    if (props[func]) {
      props[func](...args);
    }
  }, []);

  const source = useMemo(() => {
    const injectedJavaScript =
        injectedSignaturePad +
        injectedApplication({
          ...props,
          backgroundColor: StyleSheet.flatten(style).backgroundColor,
        });
    return {
      html: htmlContent(injectedJavaScript),
    };
  }, [props]);

  return (
      <WebView
          automaticallyAdjustContentInsets={false}
          onMessage={onMessage}
          renderError={onError}
          renderLoading={noopFunction}
          source={source}
          javaScriptEnabled={true}
          style={style}
      />
  );
};

export default memo(SignaturePad);
