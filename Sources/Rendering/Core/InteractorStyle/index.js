import * as macro from '../../../macro';
import vtkInteractorObserver from '../InteractorObserver';
import { STATES } from './Constants';  // { ENUM_1: 0, ENUM_2: 1, ... }

// ----------------------------------------------------------------------------
// Global methods
// ----------------------------------------------------------------------------

// Add module-level functions or api that you want to expose statically via
// the next section...

const stateNames = {
  Rotate: STATES.VTKIS_ROTATE,
  Pan: STATES.VTKIS_PAN,
  Spin: STATES.VTKIS_SPIN,
  Dolly: STATES.VTKIS_DOLLY,
  Zoom: STATES.VTKIS_ZOOM,
  Timer: STATES.VTKIS_TIMER,
  TwoPointer: STATES.VTKIS_TWO_POINTER,
  UniformScale: STATES.VTKIS_USCALE,
};

const events = [
  'Enter',
  'Leave',
  'MouseMove',
  'LeftButtonPress',
  'LeftButtonRelease',
  'MiddleButtonPress',
  'MiddleButtonRelease',
  'RightButtonPress',
  'RightButtonRelease',
  'MouseWheelForwardEvent',
  'MouseWheelBackwardEvent',
  'ExposeEvent',
  'ConfigureEvent',
  'TimerEvent',
  'KeyPressEvent',
  'KeyReleaseEvent',
  'CharEvent',
  'DeleteEvent',
  'PinchEvent',
  'PanEvent',
  'RotateEvent',
  'TapEvent',
  'LongTapEvent',
  'SwipeEvent',
];

// ----------------------------------------------------------------------------
// Static API
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// vtkMyClass methods
// ----------------------------------------------------------------------------

function vtkInteractorStyle(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkInteractorStyle');

  // Public API methods
  publicAPI.setInteractor = (i) => {
    if (i === model.nteractor) {
      return;
    }

    // if we already have an Interactor then stop observing it
    if (model.interactor) {
      model.unsubscribes.forEach(val => val());
      model.unsubscribes = [];
    }

    model.interactor = i;

    if (i) {
      events.forEach(eventName => {
        model.unsubscribes[eventName] =
        i[`on${eventName}`](() => {
          if (publicAPI[`handle${eventName}`]) {
            publicAPI[`handle${eventName}`]();
          }
        });
      });
    }
  };

  // create bunch of Start/EndState methods
  Object.keys(stateNames).forEach(key => {
    publicAPI[`start${key}`] = () => {
      if (model.state !== STATES.VTKIS_NONE) {
        return;
      }
      publicAPI.startState(stateNames[key]);
    };
    publicAPI[`end${key}`] = () => {
      if (model.state !== stateNames[key]) {
        return;
      }
      publicAPI.stopState();
    };
  });

  //----------------------------------------------------------------------------
  publicAPI.findPokedRenderer = (x, y) => {
    publicAPI.setCurrentRenderer(model.interactor.findPokedRenderer(x, y));
  };

  publicAPI.startState = (state) => {
    model.state = state;
    if (model.animationState === STATES.VTKIS_ANIM_OFF) {
      const rwi = model.interactor;
      rwi.getRenderWindow().setDesiredUpdateRate(rwi.getDesiredUpdateRate());
      model.invokeStartInteractionEvent({ type: 'StartInteractionEvent' });
      // if (model.seTimers &&
      //      !(model.timerId = rwi.createRepeatingTimer(model.timerDuration)) ) {
      //   // vtkTestingInteractor cannot create timers
      //   if (std::string(rwi->GetClassName()) != "vtkTestingInteractor")
      //     {
      //     vtkErrorMacro(<< "Timer start failed");
      //     }
      //   this->State = VTKIS_NONE;
      //   }
    }
  };

  publicAPI.stopState = () => {
    model.state = STATES.VTKIS_NONE;
    if (model.animationState === STATES.VTKIS_ANIM_OFF) {
      const rwi = model.interactor;
      rwi.getRenderWindow().setDesiredUpdateRate(rwi.getStillUpdateRate());
      // if (this->UseTimers &&
      //     // vtkTestingInteractor cannot create timers
      //     std::string(rwi->GetClassName()) != "vtkTestingInteractor" &&
      //     !rwi->DestroyTimer(this->TimerId))
      //   {
      //   vtkErrorMacro(<< "Timer stop failed");
      //   }
      publicAPI.invokeEndInteractionEvent({ type: 'EndInteractionEvent' });
      rwi.render();
    }
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  state: STATES.VTKIS_NONE,
  animState: STATES.VTKIS_ANIM_OFF,
  handleObservers: 1,
  autoAdjustCameraClippingRange: 1,
  unsubscribes: [],
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  vtkInteractorObserver.extend(publicAPI, model);

  // Object methods
  macro.obj(publicAPI, model);

  // Create get-only macros
  // macro.get(publicAPI, model, ['myProp2', 'myProp4']);

  // Create get-set macros
  // macro.getSet(publicAPI, model, ['myProp3']);

  // Create set macros for array (needs to know size)
  // macro.setArray(publicAPI, model, ['myProp5'], 4);

  // Create get macros for array
  // macro.getArray(publicAPI, model, ['myProp1', 'myProp5']);

  // For more macro methods, see "Sources/macro.js"

  // Object specific methods
  vtkInteractorStyle(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend);

// ----------------------------------------------------------------------------

export default Object.assign({ newInstance, extend });
