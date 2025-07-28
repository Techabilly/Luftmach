# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Features
- Adjustable wing mount position along the fuselage using the new "Mount Position" control.
- Independent vertical and horizontal fuselage taper with adjustable start positions.
- Independent top and bottom fuselage tapers.
- Curvature controls for both horizontal and vertical fuselage tapers.
- Fuselage tapers now form smooth curves rather than abrupt angles.
- Adjustable tail height relative to the nose using the new "Tail Height" control.
- Fuselage ends are automatically beveled and closed.
- Adjustable fuselage height independent of width.
- Option to choose an elliptical or square fuselage shape.
- Optional nacelles can be added at the end of each wing panel.
- A rudder can be added to the rear of the fuselage.
- The rudder now uses the same sweep and chord controls as a wing
  (without mirroring or airfoil support).
- The rudder can be shifted forward or backward along the fuselage.
- The fuselage can be hidden entirely if desired.
- Elevator geometry can now be customized with independent root and tip chords,
  span, sweep, dihedral and airfoil settings.
