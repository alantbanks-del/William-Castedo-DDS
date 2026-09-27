Case images go here. Four per case, named by case number:

  case-01-before.jpg        clinical photo, before
  case-01-after.jpg         clinical photo, after
  case-01-pano-before.jpg   panoramic radiograph, before
  case-01-pano-after.jpg    panoramic radiograph, after

...through case-30. Any missing image shows a labeled placeholder instead,
so the page still looks finished while cases are being added.

Clinical photos display at 4:3, panos at 2:1. About 1200px wide is plenty.
Titles, dates, tags and Dr. Castedo's notes are edited in js/cases.js.

Adding images from the page itself:
Drag a photo or a PDF onto any slot (or click it). A PDF's first page is converted
to an image, a crop window opens locked to the right shape (4:3 photos, 2:1 panos),
and the cropped file downloads named correctly. Drop that file in this folder.
PDF conversion uses pdf.js from cdnjs, so the browser needs to be online for it.
