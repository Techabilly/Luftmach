import React, { useEffect } from 'react';
import Wing from './Wing.jsx';
import Elevator from './Elevator.jsx';
import Rudder from './Rudder.jsx';
import Nacelle from './Nacelle.jsx';
import Fuselage from './Fuselage.jsx';
import { useUi } from '../ui/UiContext.jsx';

/**
 * Renders aircraft parts based on the UI context. All props received are
 * forwarded to the individual part components so existing props continue to
 * work. Each rendered part is wrapped in a group with a partId so the 3D view
 * can determine which part was clicked.
 */
export default function Aircraft(props) {
  const { enabledParts, registry, registerParts, selectPart } = useUi();

  // register known parts on mount
  useEffect(() => {
    registerParts([
      { id: 'wing', label: 'Wing', Component: Wing },
      { id: 'elevator', label: 'Elevator', Component: Elevator },
      { id: 'rudder', label: 'Rudder', Component: Rudder },
      { id: 'nacelle', label: 'Nacelle', Component: Nacelle },
      { id: 'fuselage', label: 'Fuselage', Component: Fuselage },
    ]);
  }, [registerParts]);

  return (
    <group>
      {enabledParts.map((id) => {
        const Item = registry[id]?.Component;
        if (!Item) return null;
        return (
          <group
            key={id}
            userData={{ partId: id }}
            onClick={(e) => {
              e.stopPropagation();
              selectPart(id);
            }}
          >
            <Item {...props} />
          </group>
        );
      })}
    </group>
  );
}
