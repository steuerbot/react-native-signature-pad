import React, {memo, useCallback, useMemo} from 'react';
import {WebView} from 'react-native-webview';

import htmlContent from './injectedHtml';
import injectedSignaturePad from './injectedJavaScript/signaturePad';
import injectedApplication from './injectedJavaScript/application';
import injectedErrorHandler from './injectedJavaScript/errorHandler';
import injectedExecutePropsFunction from './injectedJavaScript/executePropsFunction';

const noopFunction = () => {};

const SignaturePad = (props) => {
  const {
    onChange = noopFunction,
    onError = noopFunction,
    style,
  } = props;

  const executeNativeFunction = useCallback((message) => {
    if(message.executeFunction && message.arguments) {
      const parsedArguments = JSON.parse(message.arguments);

      const referencedFunction = props[message.executeFunction];
      if(typeof(referencedFunction) === 'function') {
        referencedFunction(parsedArguments);
        return true;
      }
    }
    return false;
  }, [props]);

  const onNavigationStateChange = useCallback(({url}) => {
    const newUrl = unescape(url);
    //Example input:
    //applewebdata://4985ECDA-4C2B-4E37-87ED-0070D14EB985#executeFunction=jsError&arguments=%7B%22message%22:%22ReferenceError:%20Can't%20find%20variable:%20WHADDUP%22,%22url%22:%22applewebdata://4985ECDA-4C2B-4E37-87ED-0070D14EB985%22,%22line%22:340,%22column%22:10%7D"
    //All parameters to the native world are passed via a hash url where every parameter is passed as &[ParameterName]<-[Content]&
    const hashUrlIndex = newUrl.lastIndexOf('#');
    if(hashUrlIndex === -1) {
      return;
    }

    let hashUrl = newUrl.substring(hashUrlIndex);
    hashUrl = decodeURIComponent(hashUrl);
    const regexFindAllSubmittedParameters = /&(.*?)&/g;

    const parameters = {};
    let parameterMatch = regexFindAllSubmittedParameters.exec(hashUrl);
    if(!parameterMatch) {
      return;
    }

    while(parameterMatch) {
      const parameterPair = parameterMatch[1]; //For example executeFunction=jsError or arguments=...

      const parameterPairSplit = parameterPair.split('<-');
      if(parameterPairSplit.length === 2) {
        parameters[parameterPairSplit[0]] = parameterPairSplit[1];
      }

      parameterMatch = regexFindAllSubmittedParameters.exec(hashUrl);
    }

    if(!executeNativeFunction(parameters)) {
      console.warn({parameters, hashUrl}, 'Received an unknown set of parameters from WebView');
    }
  }, [executeNativeFunction]);

  const onMessage = useCallback((event) => {
    const base64DataUrl = JSON.parse(event.nativeEvent.data);
    onChange(base64DataUrl);
  }, []);

  const source = useMemo(() => {
    const injectedJavaScript = injectedExecutePropsFunction
        + injectedErrorHandler
        + injectedSignaturePad
        + injectedApplication(props);
    const html = htmlContent(injectedJavaScript);
    return {html};
  }, [props]);

  return <WebView automaticallyAdjustContentInsets={false}
                  onNavigationStateChange={onNavigationStateChange}
                  onMessage={onMessage}
                  renderError={onError}
                  renderLoading={noopFunction}
                  source={source}
                  javaScriptEnabled={true}
                  style={style}/>
};

export default memo(SignaturePad);

