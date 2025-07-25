/* eslint-disable react-refresh/only-export-components */
import React, { useRef } from 'react';
import { Components, useDrag, invertedRange, range, useTh, styled, createPlugin, useInputContext } from 'leva/plugin';

const { Row, Label, Number: NumberInput } = Components;

const Range = styled('div', {
  position: 'relative',
  width: '100%',
  height: 2,
  borderRadius: '$xs',
  backgroundColor: '$elevation1',
});

const Scrubber = styled('div', {
  position: 'absolute',
  width: '$scrubberWidth',
  height: '$scrubberHeight',
  borderRadius: '$xs',
  boxShadow: '0 0 0 2px $colors$elevation2',
  backgroundColor: '$accent2',
  cursor: 'pointer',
  $active: 'none $accent1',
  $hover: 'none $accent3',
});

const RangeWrapper = styled('div', {
  position: 'relative',
  $flex: '',
  height: '100%',
  cursor: 'pointer',
  touchAction: 'none',
});

const Indicator = styled('div', {
  position: 'absolute',
  height: '100%',
  backgroundColor: '$accent2',
});

function sanitizeStep(v, { step, initialValue }) {
  const steps = Math.round((v - initialValue) / step);
  return initialValue + steps * step;
}

function RangeSlider({ value, min, max, onDrag, step, initialValue }) {
  const ref = useRef(null);
  const scrubberRef = useRef(null);
  const rangeWidth = useRef(0);
  const scrubberWidth = useTh('sizes', 'scrubberWidth');
  const bind = useDrag(({ event, first, xy: [x], movement: [mx], memo }) => {
    if (first) {
      const { width, left } = ref.current.getBoundingClientRect();
      rangeWidth.current = width - parseFloat(scrubberWidth);
      const targetIsScrub = event?.target === scrubberRef.current;
      memo = targetIsScrub ? value : invertedRange((x - left) / width, min, max);
    }
    const newValue = memo + invertedRange(mx / rangeWidth.current, 0, max - min);
    onDrag(sanitizeStep(newValue, { step, initialValue }));
    return memo;
  });
  const pos = range(value, min, max);
  return (
    <RangeWrapper ref={ref} {...bind()}>
      <Range>
        <Indicator style={{ left: 0, right: `${(1 - pos) * 100}%` }} />
      </Range>
      <Scrubber ref={scrubberRef} style={{ left: `calc(${pos} * (100% - ${scrubberWidth}))` }} />
    </RangeWrapper>
  );
}

const ResetRangeGrid = styled('div', {
  variants: {
    hasRange: {
      true: {
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'auto $sizes$numberInputMinWidth auto',
        columnGap: '$colGap',
        alignItems: 'center',
      },
    },
  },
});

function ResetNumberComponent() {
  const props = useInputContext();
  const { label, value, onUpdate, settings, id } = props;
  const { min, max, initialValue } = settings;
  const hasRange = max !== Infinity && min !== -Infinity;
  return (
    <Row input>
      <Label>{label}</Label>
      <ResetRangeGrid hasRange={hasRange}>
        {hasRange && <RangeSlider value={parseFloat(value)} onDrag={onUpdate} {...settings} />}
        <NumberInput {...props} id={id} label="value" innerLabelTrim={hasRange ? 0 : 1} />
        <button style={{ marginLeft: 4 }} onClick={() => onUpdate(initialValue)}>↺</button>
      </ResetRangeGrid>
    </Row>
  );
}

export const resetNumber = createPlugin({ component: ResetNumberComponent });
