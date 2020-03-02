import React from "react";
import ReactDataGrid from "react-data-grid";
import { Editors } from "react-data-grid-addons";

const { DraggableHeader: { DraggableContainer } } = require("react-data-grid-addons");

//Properties for all columns
const defaultColumnProperties = {
    resizable: true,
    sortable: true
};

//Properties for the dropDown on the column 'available'
const { DropDownEditor } = Editors;
const yesNo = [
    { id: "yes", value: "Yes" },
    { id: "no", value: "No" },
    { id: "unknow", value: "Unknow" }
];
const YesNoEditor = <DropDownEditor options={yesNo} />;

class Users extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            { key: "id", name: "ID", sortDescendingFirst: true, frozen: true, width: 30 },
            { key: "firstName", name: "First Name", frozen: true, width: 145, draggable: true, editable: true, },
            { key: "lastName", name: "Last Name", frozen: true, width: 145, draggable: true, editable: true },
            { key: "email", name: "Email", width: 260, draggable: true, editable: true },
            { key: "phoneNumber", name: "Phone Number", width: 115, draggable: true, editable: true },
            { key: "available", name: "Available", width: 80, draggable: true, editor: YesNoEditor }
        ].map(c => ({ ...c, ...defaultColumnProperties }));
        this.state = {
            allUsers: [],
            columns: this.columns
        };
    }

    //Called immediately after a component is mounted.
    componentDidMount() {
        this.getAllUsers()
    }

    //Get All Users in allUsers[]
    getAllUsers() {
        console.log("Call getAllUsers")
        fetch('/users')
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        allUsers: result
                    })
                }, (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }

    //**********REACT DATA GRID FUNCTIONS***************** */

    //Sorting columns by click on the head
    handleGridSort = (sortColumn, sortDirection) => {
        const comparer = (a, b) => {
            sortColumn = sortDirection === 'NONE' ? "id" : sortColumn;
            if (sortDirection === 'ASC') {
                return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
            } else if (sortDirection === 'DESC') {
                return (a[sortColumn] < b[sortColumn]) ? 1 : -1;
            } else {
                sortColumn = "id";
                return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
            }
        };
        this.setState(this.state.allUsers.sort(comparer));
    };

    //Function to edit cells by double click
    onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
        this.setState(state => {
            const allUsers = state.allUsers.slice();
            let oneUser = {}
            for (let i = fromRow; i <= toRow; i++) {
                allUsers[i] = { ...allUsers[i], ...updated };
                oneUser = allUsers[i];
            }
            fetch("/users/" + oneUser.id, {
                method: 'PUT',
                body: JSON.stringify({
                    id: oneUser.id,
                    firstName: oneUser.firstName,
                    lastName: oneUser.lastName,
                    email: oneUser.email,
                    phoneNumber: oneUser.phoneNumber,
                    available: oneUser.available
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(res => {
                    console.log('Responce :', res)
                    return res.json()
                })
                .then(
                    (result) => {
                        console.log('Success:', result)
                    }, (error) => {
                        this.setState({
                            error
                        });
                    }
                )
            return { allUsers };
        });
    };

    //Reorder column by drag and drop
    onHeaderDrop = (source, target) => {
        const stateCopy = Object.assign({}, this.state);
        const columnSourceIndex = this.state.columns.findIndex(
            i => i.key === source
        );
        const columnTargetIndex = this.state.columns.findIndex(
            i => i.key === target
        );

        stateCopy.columns.splice(
            columnTargetIndex,
            0,
            stateCopy.columns.splice(columnSourceIndex, 1)[0]
        );

        const emptyColumns = Object.assign({}, this.state, { columns: [] });
        this.setState(emptyColumns);

        const reorderedColumns = Object.assign({}, this.state, {
            columns: stateCopy.columns
        });
        this.setState(reorderedColumns);
    };

    //Main render
    render() {
        return (
            <DraggableContainer onHeaderDrop={this.onHeaderDrop}>
                <ReactDataGrid
                    columns={this.state.columns}
                    rowGetter={i => this.state.allUsers[i]}
                    rowsCount={this.state.allUsers.length}
                    onGridRowsUpdated={this.onGridRowsUpdated}
                    enableCellSelect={true}
                    onGridSort={this.handleGridSort}
                    minHeight={800}
                />
            </DraggableContainer>
        );
    }
}

export default Users;
