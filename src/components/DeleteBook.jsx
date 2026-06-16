import { useState, useEffect } from "react";

import api from "../api/axios";
// const API_URL = "http://localhost:3001";
import { Link, useNavigate, useParams } from "react-router-dom";

function DeleteBook() {
  const navigate = useNavigate(); 

  const [book, setBook] = useState({
    title: "",
    author: "",
    genre: "",
    price: "",
    stock: ""
  });
  // const token = localStorage.getItem("token");
  const { id } = useParams();

  useEffect(() => {
    const fetchBook = async () => {
      try {


      console.log("Fetching book with id:", id);

        const response = await api.get(`/books/${id}`);

        setBook(response.data);

      } catch (error) {

        console.error(error);
      }
    };

  fetchBook();
  }, [id]);

  const handleChange = (e) => {
    setBook({
      ...book,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        await api.delete(`/books/${id}`, book);

          alert("Book Deleted successfully");

          navigate("/books");
      } catch(error){
          console.error(error);
          alert("Error updating book");
      }
    };

 

  return (
    <div>

    <h2>Confirm you are deleting this Book</h2>
    <form onSubmit={handleSubmit}>
      <input name="title" readOnly={true}  onChange={handleChange} value={ book.title} />
      <input name="author" readOnly={true}  onChange={handleChange} value={ book.author}/>
      <input name="genre" readOnly={true}  onChange={handleChange} value={ book.genre} />
      <input name="price" readOnly={true}  onChange={handleChange} value={ book.price} />
      <input name="stock" readOnly={true}  onChange={handleChange} value={ book.stock} />
      <br/>
      <br/>
      <button className="delete-button" type="submit">Delete Book</button>
    </form>
    </div>

  );
}


export default DeleteBook;