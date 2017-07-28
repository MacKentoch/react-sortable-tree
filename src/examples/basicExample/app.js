// @flow weak

import React, { Component } from 'react';
import SortableTree, {
  toggleExpandedForAll,
  getFlatDataFromTree,
  getTreeFromFlatData,
  changeNodeAtPath
} from '../../index';
import TreeModel from 'tree-model';
// import { 
//   getFlatDataFromTree,
//   getTreeFromFlatData,
//   changeNodeAtPath
// } from '../../utils/tree-data-utils';
import styles from './stylesheets/app.scss';
import '../shared/favicon/apple-touch-icon.png';
import '../shared/favicon/favicon-16x16.png';
import '../shared/favicon/favicon-32x32.png';
import '../shared/favicon/favicon.ico';
import '../shared/favicon/safari-pinned-tab.svg';

const maxDepth = 5;

class App extends Component {
  constructor(props) {
    super(props);

    const renderDepthTitle = ({ path }) => `Depth: ${path.length}`;

    this.state = {
      searchString: '',
      searchFocusIndex: 0,
      searchFoundCount: null,

      parentNodeWhereAddingNode: '0A0',
      childNodeTitleToAdd: '',

      nodeKey: '_id',
      parentKey: 'parent',
      rootKey: 'COULD_BE_PRODUCT_KEY',

      flatTreeData: [
        {
          "_id" : "5978aba17d06e6a456496e32",
          "name": "2",
          "product" : "5978aba17d06e6a456496e31"
        },
        {
          "_id" : "5978aba17d06e6a456496e33",
          "name": "2.1",
          "product" : "5978aba17d06e6a456496e31",
          "parent" : "5978aba17d06e6a456496e32"
        },
        {
          "_id" : "5978aba17d06e6a456496e34",
          "name": "2.1.1",
          "product" : "5978aba17d06e6a456496e31",
          "parent" : "5978aba17d06e6a456496e33"
        }
      ],
      treeData: [],
      treeDataFromFlatData: [],
    };

    this.updateTreeData = this.updateTreeData.bind(this);
    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
    this.initTreeDataFromFlatData = this.initTreeDataFromFlatData.bind(this);
    this.sendFlatDataToBackEnd = this.sendFlatDataToBackEnd.bind(this);
  }

  componentDidMount() {
    this.initTreeDataFromFlatData();
  }

  expand(expanded) {
    this.setState({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded,
      }),
    });
  }

  expandAll() {
    this.expand(true);
  }

  collapseAll() {
    this.expand(false);
  }

  updateTreeData(treeData) {
    this.setState({ treeData });

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    // console.log('update tree event, changed treeData: ', treeData);

    // const getNodeKey = ({ node }) =>  node.uniqueKey;

    // const ROOT_NODE_KEY = this.state.rootKey; // parent node "virtual" (or default parent or level 0 parent) to all nodes

    // const flatDataFromTree = getFlatDataFromTree({
    //   treeData,
    //   getNodeKey,
    //   ignoreCollapsed: false
    // });
  
    // const cleanFlatData = (flatData = []) => 
    //   flatData.map(
    //     node => ({
    //       // keys or indexes:
    //       _id: node.node[],
    //       parentKey: node.parentNode ? node.parentNode.uniqueKey : ROOT_NODE_KEY,
    //       // react-sortable-tree node props:
    //       title:    node.node.title,
    //       subtitle: node.node.subtitle ? node.node.subtitle : '',
    //       expanded: node.node.expanded ? node.node.expanded : false
    //     })
    //   );
    
    // console.log('RAW flat tree data from updated tree: ',  flatDataFromTree);
    // console.log('CLEANED flat tree data from updated tree: ',  cleanFlatData(flatDataFromTree));

    // const treeFromFlatData = getTreeFromFlatData({
    //   flatData:     cleanFlatData(flatDataFromTree),
    //   getKey:       node => node.uniqueKey,
    //   getParentKey: node => node.parentKey,
    //   rootKey:      ROOT_NODE_KEY
    // });

    // this.setState({ flatTreeData: cleanFlatData(flatDataFromTree) });
    // this.setState({ treeDataFromFlatData: treeFromFlatData });

    // console.log('tree data from flat data of updated tree: ',  treeFromFlatData);

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
  }

  initTreeDataFromFlatData() {
    const {
      rootKey,
      nodeKey,
      parentKey,
      flatTreeData
    } = this.state;

    function prepareFlatDataForFront(flatData = []) {
      return flatData.map(
        node => ({
          // keys or indexes:
          _id:      node[nodeKey],
          parent:   node[parentKey] ? node[parentKey] : rootKey,
          product:  node.product,
          // react-sortable-tree node props:
          title:    node.name,
          subtitle: node.product ? `product: ${node.product}` : '',
          expanded: node.expanded ? node.expanded : false
        })
      );
    }

    console.log('prepared flatData: ', prepareFlatDataForFront(flatTreeData));

    const treeData = getTreeFromFlatData({
      flatData:     prepareFlatDataForFront(flatTreeData),
      getKey:       node => node[nodeKey],
      getParentKey: node => node[parentKey],
      rootKey
    });

    
    console.log(`
    
      INIT TREEDATA (IN FRONT from BACKEND DATA)
    
    `);
    console.log('flatTreeData: ', flatTreeData);
    console.log('treeData: ', treeData);

    this.setState({ treeData });
  }

  sendFlatDataToBackEnd() {
    const {
      rootKey,
      nodeKey,
      parentKey,
      treeData
    } = this.state;

    function prepareFlatDataForBackend(flatData = []) {
      return flatData.map(
        node => {
          const nodeToReturn = {
            // keys or indexes:
            _id: node.node[nodeKey],
            product: node.node.product,
            // react-sortable-tree node props:
            name:    node.node.title,
            // subtitle: node.node.subtitle ? node.node.subtitle : '',
            // expanded: node.node.expanded ? node.node.expanded : false
          };

          // no need for virtual root key in backend, so delete it
          if (node.node[parentKey] === rootKey) {
            return nodeToReturn;
          }

          return {
            ...nodeToReturn,
            parent: node.node[parentKey] ? node.node[parentKey] : rootKey,
          }
        }
      );
    }

    const getNodeKey = ({ node }) =>  node[nodeKey];


    const flatDataFromTree = getFlatDataFromTree({
      treeData,
      getNodeKey,
      ignoreCollapsed: false
    });

    const flatDataForBackEnd = prepareFlatDataForBackend(flatDataFromTree);

    console.log(`
    
      SENT TREEDATA (TO BACKEND)
    
    `);
    console.log('treeData');
    console.log('raw flat data: ', flatDataFromTree);
    console.log('flatDataForBackEnd: ', flatDataForBackEnd);
  }

  render() {
    const projectName = 'React Sortable Tree';


    const {
      treeData,
      searchString,
      searchFocusIndex,
      searchFoundCount,
    } = this.state;

    const alertNodeInfo = ({ node, path, treeIndex }) => {
      const objectString = Object.keys(node)
        .map(k => (k === 'children' ? 'children: Array' : `${k}: '${node[k]}'`))
        .join(',\n   ');

      global.alert(
        'Info passed to the button generator:\n\n' +
          `node: {\n   ${objectString}\n},\n` +
          `path: [${path.join(', ')}],\n` +
          `treeIndex: ${treeIndex}`
      );
    };

    const selectPrevMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1,
      });

    const selectNextMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0,
      });

    const isVirtualized = true;
    const treeContainerStyle = isVirtualized ? { height: 450 } : {};

    return (
      <div>
        <section className={styles['page-header']}>
          <h1 className={styles['project-name']}>
            {projectName}
          </h1>

          <h2 className={styles['project-tagline']}>
            Drag-and-drop sortable representation of hierarchical data
          </h2>
        </section>

        <section className={styles['main-content']}>
          <h3>Demo</h3>
          <h4>
            add node under parent test
          </h4>
          <div style={{ display: 'inline-block' }}>
            <span style={{ width: '120px' }}>
              parent node: 
            </span>
            <input 
              type="text"
              value={this.state.parentNodeWhereAddingNode}
              onChange={({ target: { value } }) => (this.setState({ parentNodeWhereAddingNode: value.trim() }))}
            />
          </div>
          <div style={{ display: 'inline-block' }}>
            <span style={{ width: '120px' }}>
              new child node title: 
            </span>
            <input 
              type="text"
              value={this.state.childNodeTitleToAdd}
              onChange={({ target: { value } }) => (this.setState({ childNodeTitleToAdd: value.trim() }))}
            />
            <button
              onClick={
                (e) => {
                  e.preventDefault();

                  const {
                    treeData: currentTreeData,
                    childNodeTitleToAdd,
                    parentNodeWhereAddingNode
                    } = this.state;

                  const newNode = {
                    uniqueKey: '9999',
                    title:     childNodeTitleToAdd
                  }

                  const parentKey       = parentNodeWhereAddingNode;
                  const ignoreCollapsed = false;
                  const expandParent    = false;
                  const getNodeKey      = ({ node }) => node._id;

                  const treeDataUpdated = changeNodeAtPath({
                    currentTreeData,
                    newNode,
                    parentKey,
                    getNodeKey,
                    ignoreCollapsed,
                    expandParent
                  });

                  this.setState({ treeData: treeDataUpdated });
                }
              }
            >
              add childNode
            </button>
          </div>
          <h4>
            demo actions
          </h4>
          <button onClick={this.expandAll}>Expand All</button>
          <button onClick={this.collapseAll}>Collapse All</button>
          <p>SIMULATE SEND DATA TO BACKEND</p>
           <button onClick={this.sendFlatDataToBackEnd}>send treeData to backend</button> 
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <form
            style={{ display: 'inline-block' }}
            onSubmit={event => {
              event.preventDefault();
            }}
          >
            <label htmlFor="find-box">
              Search:&nbsp;
              <input
                id="find-box"
                type="text"
                value={searchString}
                onChange={event =>
                  this.setState({ searchString: event.target.value })}
              />
            </label>

            <button
              type="button"
              disabled={!searchFoundCount}
              onClick={selectPrevMatch}
            >
              &lt;
            </button>

            <button
              type="submit"
              disabled={!searchFoundCount}
              onClick={selectNextMatch}
            >
              &gt;
            </button>

            <span>
              &nbsp;
              {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
              &nbsp;/&nbsp;
              {searchFoundCount || 0}
            </span>
          </form>
          <h2>
            Root key: 
            <b>
              {this.state.rootKey}
            </b>
          </h2>
          <div style={treeContainerStyle}>
            <SortableTree
              treeData={treeData}
              onChange={this.updateTreeData}
              onMoveNode={({ node, treeIndex, path }) =>
                console.log(
                  'Event onMoveNode ---> ',
                  'node:',
                  node,
                  'treeIndex:',
                  treeIndex,
                  'path:',
                  path
                )}
              maxDepth={Infinity}
              searchQuery={searchString}
              searchFocusOffset={searchFocusIndex}
              canDrag={({ node }) => !node.noDragging}
              canDrop={({ nextParent }) =>
                !nextParent || !nextParent.noChildren}

              searchFinishCallback={
                matches => {
                  console.log('searchFinishCallback, matches: ', matches);
                  this.setState({
                    searchFoundCount: matches.length,
                    searchFocusIndex:
                      matches.length > 0 ? searchFocusIndex % matches.length : 0,
                  });
                }
              }
              isVirtualized={isVirtualized}
              getNodeKey={({ node }) => node._id  }
              generateNodeProps={
                rowInfo => {
                  console.log('rowInfo: ', rowInfo);

                  return {
                    buttons: [
                      <button
                        style={{
                          verticalAlign: 'middle',
                        }}
                        onClick={() => alertNodeInfo(rowInfo)}
                      >
                        ℹ
                      </button>
                    ]
                  };

                } 
              }
            />
          </div>

          <div style={{ display: 'inline-block' }}>
              <div style={{ display: 'inline-block', width: '32%' }}>
                {
                    JSON.stringify(this.state.treeData, null, '\n')
                }
              </div>

              <div style={{ display: 'inline-block', width: '32%' }}>
                {
                  JSON.stringify(this.state.flatTreeData, null, '\n')
                }
              </div>

              <div style={{ display: 'inline-block', width: '32%' }}>
                {
                  JSON.stringify(this.state.treeDataFromFlatData, null, '\n')
                }
              </div>
          </div>

        </section>
      </div>
    );
  }
}

export default App;
