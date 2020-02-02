"use strict";
class TabularData {
    constructor(sample, name='Todo marks') {
      this.name = name
      this.proto = Object.getPrototypeOf(sample)
      this.keys = Object.getOwnPropertyNames(sample)
      console.log(this.name, this)
      this.data = []
    }
    readData(url, callback) {
      let k = this.keys
      let toArray = (t) => {
        for (let s of t.split('\n')) {
          if (!s) break //end of loop 
          let b = s.split('\t'); //TAB
          let n = Math.min(k.length, b.length)
          let x = {}
          for (let i=0; i<n; i++)
              x[k[i]] = b[i]
          if (n < b.length) { //remainder
            let r = []
            for (let i=n-1; i<b.length; i++) 
                r.push(b[i])
            x[k[n-1]] = r  //last key
          }
          Object.setPrototypeOf(x, this.proto)
          this.data.push(x)
        }
        if (callback) callback(t)
      }
      fetch(url).then(x => x.text()).then(toArray)
    }
    toString() {
      return this.keys.join(', ')
    }
  }
  
// idea from A Rajab https://a0m0rajab.github.io/LearningQuest/googleDocs/submitForm.html
// https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/
// https://bionicteaching.com/silent-submission-of-google-forms/

const FORM_URL = "https://docs.google.com/forms/d/e/"
    +"1FAIpQLScbLFzsO3ugLVVO8TWS28pmsvrGnf9yyFyYv4UIK8tncCA_NA/"
const DOCS_URL = "https://docs.google.com/spreadsheets/u/1/d/e/"
    +"2PACX-1vStbPfY8oQuJKDQwIiFwRMs5V6loOPmr3gzc8UQN36z4cbfLZuPedXePhgq9053P7KsDA8YZ42cvBVE/"

function submitData(user, topic, marks) { //to Google Forms -- add one line
    //magic numbers in the link are from "Get pre-filled link" menu
    const link = FORM_URL+"formResponse?usp=pp_url"
        +"formResponse?usp=pp_url"
        +"&entry.1395280695="+user
        +"&entry.387807091="+topic
        +"&entry.1944284271="+marks
    //  +"&submit=Submit" not needed
    const post = document.createElement("iframe")
    post.src = decodeURI(link)
    post.id = "postID"
    post.hidden = true;
    document.body.appendChild(post)
    const removeElement = () => {post.parentNode.removeChild(post)}
    setTimeout(removeElement, 2000);
}
// Try various ways to read from Google Sheets -- show all data
const URL = DOCS_URL+'pub?output=tsv' //tab-separated values
function fetchData(success, failure) { //simplest method
    fetch(URL)
      .then(r => r.text()) 
      .then(success).catch(failure)
}
function tabularData(success) { //uses fetch
    const B = {time:0, user:0, topic:0, marks:0}
    const bm = new TabularData(B) //external class
    bm.readData(URL, t => {success(t, bm.data)})
}
function readLinkData(success, failure) { //complicated XML
    const xmlhttp = new XMLHttpRequest()
    xmlhttp.open('GET', URL, true);
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
             success(xmlhttp.responseText)
        else failure(xmlhttp)
    }
    xmlhttp.send(null)
}
