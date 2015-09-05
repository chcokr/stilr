import stilr from './index';

import create from 'lodash.create';
import EventEmitter from 'emmett';
import frameDebounce from 'frame-debounce';

const emitter = new EventEmitter();

let prevSheetMap = null;

function addPrefixedCSSToBody() {
  const newSheetMap = stilr.__stylesheet;

  let newRulesOnlyMap = new stilr.Map();

  for (let [key, val] of newSheetMap) {
    if (!prevSheetMap.get(key)) {
      newRulesOnlyMap.set(key, val);
    }
  }

  const newRulesOnlyCSSContent = stilr.render({pretty: false}, newRulesOnlyMap);

  const styleElem = document.createElement('style');
  styleElem.textContent = newRulesOnlyCSSContent;
  document.head.appendChild(styleElem);

  prevSheetMap = stilr.__stylesheet;
}

const debouncedAddPrefixedCSSToBody = frameDebounce(addPrefixedCSSToBody);

export default create(stilr, {
  attachHotLoadHandler() {
    if (process.env.NODE_ENV !== 'production') {
      emitter.on('update', () => {
        debouncedAddPrefixedCSSToBody();
      });
    }
  },
  create(styles, stylesheet = stilr.__stylesheet) {
    var rtn = stilr.create(styles, stylesheet);
    emitter.emit('update');
    return rtn;
  },
  on(...args) {
    emitter.on(...args);
  }
});
