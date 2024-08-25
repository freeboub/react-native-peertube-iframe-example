/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useRef, useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import PeertubeIframe, {
  PLAYER_STATES,
  PeertubeCaption,
  PeertubeIframeRef,
  PeertubePlaybackQuality,
} from 'react-native-peertube-iframe';

import {Colors} from 'react-native/Libraries/NewAppScreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const playerRef = useRef<PeertubeIframeRef | null>(null);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [paused, setPaused] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rates, setRates] = useState<number[] | undefined>();
  const [selectedRate, setSelectedRate] = useState<number>();
  const [selectedQuality, setSelectedQuality] =
    useState<PeertubePlaybackQuality>();
  const [qualities, setQualities] = useState<PeertubePlaybackQuality[]>();
  const [captions, setCaptions] = useState<PeertubeCaption[]>([]);

  // const selectedCaption = captions.find(x => x.mode === 'showing');

  const positionRef = useRef(0);

  const refreshState = () => {
    console.log('refreshState Player is ready');
    if (!playerRef.current) {
      return;
    }
    const getAvailablePlaybackRatesPromise: Promise<number[]> =
      playerRef.current.getAvailablePlaybackRates();
    const getPlaybackRatePromise: Promise<number> =
      playerRef.current.getPlaybackRate();

    const getAvailablePlaybackQualitiesPromise: Promise<
      PeertubePlaybackQuality[]
    > = playerRef.current.getAvailablePlaybackQualities();

    const durationPromise: Promise<number> = playerRef.current.getDuration();
    const positionPromise: Promise<number> = playerRef.current.getCurrentTime();

    const getAvailableCaptionPromise: Promise<PeertubeCaption[]> =
      playerRef.current.getAvailableCaption();

    Promise.all([
      getAvailableCaptionPromise,
      getAvailablePlaybackRatesPromise,
      getPlaybackRatePromise,
      getAvailablePlaybackQualitiesPromise,
      durationPromise,
      positionPromise,
    ])
      .then(([_captions, _rates, _rate, _qualities, _duration, _position]) => {
        console.log('refreshState _captions', _captions);
        console.log('refreshState _rates', _rates);
        console.log('refreshState _qualities', _qualities);
        setRates(_rates);
        setSelectedRate(_rate);
        setQualities(_qualities);
        setCaptions(_captions);
      })
      .catch(() => {
        console.log('error handling initial state');
      });
  };

  const onChangeState = (state: PLAYER_STATES) => {
    console.log('------- state', state);
  };

  const videoUrl =
    'https://video.lemediatv.fr/videos/embed/b9e8a50c-cb27-4ab0-9a83-dc82082a558b';
  // const videoUrl = "https://diode.zone/video-playlists/embed/29fab3ae-a616-497a-959f-8606153bd4c0"

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container} pointerEvents="none">
        <PeertubeIframe
          ref={playerRef}
          videoUrl={videoUrl}
          height={400}
          play={!paused}
          onChangeState={onChangeState}
          // FIXME not available to be removed and open ticket...
          // onPlaybackRateChange={state => {
          //   console.log('------- onPlaybackRateChange', state);
          //   setSelectedRate(state);
          // }}
          onChangePosition={value => {
            console.log('------- onPlaybackPositionChange', value);
            positionRef.current = value;
          }}
          onChangeDuration={value => {
            console.log('------- onPlaybackDurationChange', value);
          }}
          onPlaybackQualityChange={state => {
            console.log('------- onPlaybackQualityChange', state);
            setSelectedQuality(state);
          }}
          onFullScreenChange={state => {
            console.log('------- onFullScreenChange', state);
          }}
          onChangeVolume={state => {
            console.log('------- onChangeVolume', state);
            setVolume(state);
          }}
          initialPlayerParams={{controls: '1', muted: 1}}
          webViewProps={{webviewDebuggingEnabled: true}}
          onReady={() => setTimeout(refreshState, 1000)} // FIXME on Ready is not correctly received but sometime caption not yet available
          //onReady={refreshState} // FIXME on Ready is not correctly received
        />
      </View>
      <View style={styles.controlContainer}>
        <Pressable
          onPress={() => {
            setPaused(false);
          }}
          style={styles.pressableStyle}>
          <Text style={styles.pressableTextColorStyle}>PLAY</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setPaused(true);
          }}
          style={styles.pressableStyle}>
          <Text style={styles.pressableTextColorStyle}>PAUSE</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            playerRef.current?.seekTo(positionRef.current + 10);
          }}
          style={styles.pressableStyle}>
          <Text style={styles.pressableTextColorStyle}>SEEK+10</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            playerRef.current?.setVolume(0);
          }}
          style={styles.pressableStyle}>
          <Text style={styles.pressableTextColorStyle}>MUTE</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            playerRef.current?.setVolume(1);
          }}
          style={styles.pressableStyle}>
          <Text style={styles.pressableTextColorStyle}>UNMUTE</Text>
        </Pressable>
      </View>
      <View style={styles.rowContainer}>
        <View>
          <Text>Resolutions:</Text>
          <View style={styles.separatorHorizontal} />
          {qualities?.map(_qual => (
            <Pressable
              key={`resolution_${_qual.id}`}
              onPress={() => {
                console.log('onPress', _qual);
                playerRef.current?.setPlaybackQuality(_qual.id);
              }}>
              <Text
                style={
                  _qual.id === selectedQuality?.id ? styles.selected : undefined
                }>
                {_qual.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.separator} />
        <View>
          <Text>Captions:</Text>
          <View style={styles.separatorHorizontal} />
          {captions?.map(_captions => (
            <Pressable
              key={`captions_${_captions}`}
              onPress={act => {
                console.log('onPress', _captions, act.nativeEvent);
                if (_captions.mode === 'showing') {
                  playerRef.current?.setCaption('');
                } else {
                  playerRef.current?.setCaption(_captions.id);
                }
                playerRef.current?.getAvailableCaption().then(capti => {
                  setCaptions(capti);
                });
              }}>
              <Text
                style={
                  _captions.mode === 'showing' ? styles.selected : undefined
                }>
                {_captions.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.separator} />
        <View>
          <Text>Rates:</Text>
          <View style={styles.separatorHorizontal} />
          {rates?.map(_rate => (
            <Pressable
              key={`rate${_rate}`}
              onPress={() => {
                console.log('onPress', _rate);
                playerRef.current?.setRate(_rate);
                setSelectedRate(_rate);
              }}>
              <Text
                style={_rate === selectedRate ? styles.selected : undefined}>
                {_rate}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.separator} />
        <View>
          <Text>Volume:</Text>
          <View style={styles.separatorHorizontal} />
          <Text>{Math.floor(volume * 100)}%</Text>
        </View>
        <View style={styles.separator} />
        <View>
          <Text>plalistPosition:</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pressableStyle: {backgroundColor: 'red', width: 60, margin: 10},
  pressableTextColorStyle: {color: 'white'},
  container: {height: 400, width: '100%', backgroundColor: 'transparent'},
  separator: {width: 1, backgroundColor: 'black'},
  separatorHorizontal: {height: 1, backgroundColor: 'black'},
  selected: {fontWeight: 'bold'},
  rowContainer: {flexDirection: 'row', height: '100%'},
  controlContainer: {flexDirection: 'row'},
});

export default App;
