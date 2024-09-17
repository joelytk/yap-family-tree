const tree = document.getElementById('tree');

const fetchData = async () => {
  try {
    const previewPdf = () => {
      FamilyTree.pdfPrevUI.show(familyTree, {
        format: 'A4',
        header: '',
        footer: '',
        margin: [200, 16, 200, 16],
        landscape: true
      });
    };

    const downloadPdf = () => {
      familyTree.exportPDF({
        format: 'A4',
        padding: 16,
        landscape: true
      });
    };

    const res = await fetch('./data.json');
    const data = await res.json();
    const familyTree = new FamilyTree(tree, {
      mouseScrool: FamilyTree.action.zoom,
      scaleInitial: FamilyTree.match.boundary,
      siblingSeparation: 120,
      template: 'john',
      nodeBinding: {
        field_0: 'name',
        field_1: 'title',
        img_0: 'img'
      },
      enableSearch: false,
      toolbar: {
        zoom: true,
        fit: true
      },
      menu: {
        pdfPreview: {
          text: 'Preview PDF',
          icon: FamilyTree.icon.pdf(24, 24, '#7A7A7A'),
          onClick: previewPdf
        },
        export_pdf: {
          text: 'Export PDF',
          icon: FamilyTree.icon.pdf(24, 24, '#7A7A7A'),
          onClick: downloadPdf
        }
      },
      nodes: data
    });
    // familyTree.load(data);
    familyTree.onNodeClick(() => false);
  } catch (error) {
    console.error({ error });
  }
};

fetchData();
