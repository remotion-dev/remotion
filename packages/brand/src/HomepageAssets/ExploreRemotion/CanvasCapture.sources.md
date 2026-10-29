# Canvas Capture homepage scene

Captured the real Canvas Capture extension over the local `/docs/canvas-capture`
page using Puppeteer and Chrome for Testing 157.0.8081.0 on October 27, 2026.

- Browser viewport: 1100×900 CSS pixels, device scale factor 3
- PNG dimensions: 3300×2700
- Capture selection: left 285, top 170, width 620, height 420
- Toolbar: dragged to left 460, top 510
- Record button center: 595, 539 CSS pixels

The capture used an isolated copy of the extension with permission for localhost.
Its toolbar height was held at 60 CSS pixels so hiding the close button while
recording did not collapse the toolbar. The button and timer states are actual
extension UI; the cursor movement and click are animated in Remotion.

- [Ready to record](https://remotion.media/explore-remotion/canvas-capture-ready-2026-10-27-e98376907e87.png)
- [Recording, 00:00](https://remotion.media/explore-remotion/canvas-capture-recording-start-2026-10-27-302e5b5c7efc.png)
- [Recording, 00:01](https://remotion.media/explore-remotion/canvas-capture-recording-second-2026-10-27-bb0cccbdb9e5.png)
