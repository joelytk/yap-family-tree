const tree = document.getElementById('tree');

const familyTree = new FamilyTree(tree, {
  mouseScrool: FamilyTree.action.zoom,
  scaleInitial: 1,
  siblingSeparation: 120,
  template: 'john',
  nodeBinding: {
    field_0: 'name',
    field_1: 'title',
    img_0: 'img'
  },
  enableSearch: false
});

familyTree.onNodeClick(() => false);

const fetchData = async () => {
  try {
    const res = await fetch('./data.json');
    const data = await res.json();
    familyTree.load(data);
  } catch (error) {
    console.error({ error });
  }
};

fetchData();
