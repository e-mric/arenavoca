import {AppRegistry, LogBox} from 'react-native';
import {App} from '../../src/features/tv-learning/vega/App';
import {name} from './app.json';

// Kepler 4 / SDK 0.24's own debug overlay eagerly checks the Android safe-area
// view on Vega, then falls back to View. Omit that confirmed SDK warning and
// the two informational boot/debugger notices from the preview. Fusebox keeps
// warning details in the debugger; actual errors are still shown on screen.
// Remove the safe-area workaround when the SDK corrects its platform probe.
if (__DEV__) {
  LogBox.ignoreLogs([
    "hasViewManagerConfig('RCTSafeAreaView') is not implemented",
    "************** Running debug build of JavaScript **************",
    "Open debugger to view warnings.",
  ]);
}
AppRegistry.registerComponent(name, () => App);
