import { useState, useEffect } from "react";
import axios from 'axios'
import "./todo.css";

export default function List() {
    const [task, setTask] = useState("");
    const [todoList, setTodoList] = useState([]);
    const [group, setGroup] = useState("");
    const [groupList, setGroupList] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5000/groups").then(res => {
            setGroupList(res.data);
            const general = res.data.find(g => g.name === "General");
            if (general) {
                setSelectedGroup(general);
            } else if (res.data.length > 0) {
                setSelectedGroup(res.data[0]);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedGroup?.id) {
            axios.get(`http://localhost:5000/tasks/${selectedGroup.id}`)
                .then(res => setTodoList(res.data));
        }
    }, [selectedGroup]);

    const addGroup = async () => {
        if (!group.trim()) return;
        const res = await axios.post("http://localhost:5000/groups", { name: group });
        setGroupList([...groupList, res.data]);
        setGroup("");
    };

    const deleteGroup = async (id) => {
        if (window.confirm("Delete this group?")) {
            await axios.delete(`http://localhost:5000/groups/${id}`);
            setGroupList(groupList.filter(g => g.id !== id));
            if (selectedGroup?.id === id) setSelectedGroup(groupList[0] || null);
        }
    };


    const addTask = async () => {
        if (!task.trim() || !selectedGroup) return;
        const res = await axios.post("http://localhost:5000/tasks", {
            text: task,
            group_id: selectedGroup.id
        });
        setTodoList([...todoList, res.data]);
        setTask("");
    };

    const toggleTask = async (id) => {
        const res = await axios.put(`http://localhost:5000/tasks/${id}`);
        setTodoList(todoList.map(todo => todo.id === id ? res.data : todo));
    };

    const deleteTask = async (id) => {
        await axios.delete(`http://localhost:5000/tasks/${id}`);
        setTodoList(todoList.filter(todo => todo.id !== id));
    };

    return (
        <div className="container">
            <h1 className="title">To-do List</h1>

            {/* Add Group */}
            <div className="addGroup">
                <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="Enter new group"
                />
                <button onClick={addGroup}> + </button>
            </div>

            {/* Group Buttons */}
            <div className="groupBlock">
                {groupList
                    .filter(g => g.name === "General")
                    .map(g => (
                        <button
                            key={g.id}
                            className={`${selectedGroup?.id === g.id ? "groupBtn active" : "groupBtn"} ${g.name === "General" ? "generalBtn": ""}`}
                            onClick={() => setSelectedGroup(g)}
                        >
                            {g.name}
                        </button>
                    ))}
            
                {groupList
                    .filter(g => g.name !== "General")
                    .map(g => (
                        <div key={g.id} className="groupBtnCapsule">
                            <button
                                className={selectedGroup?.id === g.id ? "groupBtn active" : "groupBtn"}
                                onClick={() => setSelectedGroup(g)}
                            >
                                {g.name}
                            </button>
                            <button
                                className="deleteGroupBtn"
                                onClick={() => deleteGroup(g.id)}
                            >
                                ✖
                            </button>
                        </div>
                    ))}
            </div>

            {selectedGroup && (
                <div className="taskSection">
                    <div className="addTask">
                        <input
                            className="input"
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            placeholder={`Enter task for ${selectedGroup.name}`}
                        />
                        <button onClick={addTask}>Add</button>
                    </div>

                    <div className="listoftask">
                        <h3>{selectedGroup.name} Tasks</h3>
                        <ul>
                            {todoList.map((todo) => (
                                <li key={todo.id}>
                                    <span
                                        onClick={() => toggleTask(todo.id)}
                                        style={{
                                            cursor: "pointer",
                                            textDecoration: todo.completed ? "line-through" : "none",
                                        }}
                                    >
                                        {todo.text}
                                    </span>
                                    <button
                                        className="deleteTask"
                                        onClick={() => deleteTask(todo.id)}
                                    >
                                        ✖
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
