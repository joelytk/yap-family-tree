const tree = document.getElementById('tree');

const fetchData = async () => {
  try {
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
      nodes: data
    });
    familyTree.onNodeClick(() => false);
  } catch (error) {
    console.error({ error });
  }
};

fetchData();
