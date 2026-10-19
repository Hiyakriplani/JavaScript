
$(document).ready(function () {
  const QUIZ_KEY = "quizUpCustomQuizzes";
  const STATS_KEY = "quizUpStats";

  let questions = [];
  let currentQuiz = null;
  let currentIndex = 0;
  let score = 0;
  let timeLeft = 0;
  let timer = null;
  let locked = false;
  let answerHistory = [];
  let isEditingSavedQuiz = false;
  let editingQuizId = null;

  const sampleQuestions = [
    {
      question: "Which language is mainly used to add interactivity to web pages?",
      options: ["HTML", "CSS", "JavaScript", "SQL"],
      answer: 2
    },
    {
      question: "Which method selects an element by its ID in JavaScript?",
      options: ["getElementById()", "getByClass()", "selectID()", "findElement()"],
      answer: 0
    },
    {
      question: "What does CSS stand for?",
      options: [
        "Computer Style Sheets",
        "Cascading Style Sheets",
        "Creative System Syntax",
        "Colorful Style System"
      ],
      answer: 1
    },
    {
      question: "Which jQuery symbol is commonly used to access elements?",
      options: ["#", "$", "@", "&"],
      answer: 1
    },
    {
      question: "Which storage keeps data after a browser is closed?",
      options: ["sessionStorage", "localStorage", "Temporary variables", "Console"],
      answer: 1
    },
    {
      question: "Which HTTP method is commonly used to retrieve data?",
      options: ["GET", "DELETE", "PATCH", "TRACE"],
      answer: 0
    },
    {
      question: "Which HTML tag creates a hyperlink?",
      options: ["<link>", "<href>", "<a>", "<url>"],
      answer: 2
    },
    {
      question: "Which event occurs when a user clicks a button?",
      options: ["change", "click", "loadData", "hovered"],
      answer: 1
    },
    {
      question: "Which jQuery method adds a click event handler?",
      options: [".on()", ".style()", ".query()", ".htmlClick()"],
      answer: 0
    },
    {
      question: "What is AJAX commonly used for?",
      options: [
        "Changing a computer's hardware",
        "Making asynchronous requests without reloading the page",
        "Creating CSS animations only",
        "Compiling JavaScript into HTML"
      ],
      answer: 1
    }
  ];

  function readQuizzes() {
    try {
      const data = JSON.parse(localStorage.getItem(QUIZ_KEY));
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function readStats() {
    try {
      return JSON.parse(localStorage.getItem(STATS_KEY)) || {
        completed: 0,
        best: 0
      };
    } catch (error) {
      return { completed: 0, best: 0 };
    }
  }

  function saveStats(stats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  function showScreen(screenId) {
    $("#homeScreen, #editorScreen, #playScreen, #resultScreen").addClass("hidden");
    $("#" + screenId).removeClass("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function updateDashboard() {
    const quizzes = readQuizzes();
    const stats = readStats();

    $("#createdCount").text(quizzes.length);
    $("#completedCount").text(stats.completed);
    $("#homeBest").text(stats.completed ? stats.best + "%" : "—");

    $("#savedQuizzes").empty();

    if (!quizzes.length) {
      $("#savedQuizzes").html(
        '<p class="muted">No quizzes yet. Create your first quiz above!</p>'
      );
      return;
    }

    quizzes.forEach(function (quiz) {
      const item = $(`
        <div class="saved-item">
          <div>
            <h4>${escapeHTML(quiz.title)}</h4>
            <p>${escapeHTML(quiz.category || "General")} · ${quiz.questions.length} questions</p>
          </div>
          <div class="saved-actions">
            <button class="primary-btn play-saved" data-id="${escapeHTML(quiz.id)}">Play</button>
            <button class="secondary-btn edit-saved" data-id="${escapeHTML(quiz.id)}">Edit</button>
            <button class="secondary-btn delete-saved" data-id="${escapeHTML(quiz.id)}">Delete</button>
          </div>
        </div>
      `);
      $("#savedQuizzes").append(item);
    });
  }

  function updateQuestionCount() {
    const count = $("#questionEditor .question-editor").length;
    $("#questionCountLabel").text(count + (count === 1 ? " question" : " questions"));
    $("#addQuestion").prop("disabled", count >= 30);
  }

  function addQuestionCard(questionData = null) {
    const index = $("#questionEditor .question-editor").length + 1;
    const question = questionData ? questionData.question : "";
    const options = questionData ? questionData.options : ["", "", "", ""];
    const answer = questionData ? questionData.answer : 0;

    const card = $(`
      <div class="question-editor">
        <div class="question-editor-head">
          <strong>Question ${index}</strong>
          <button type="button" class="remove-question">Remove</button>
        </div>
        <input class="question-input" required maxlength="300"
          placeholder="Type your question here..."
          value="${escapeHTML(question)}">
        <div class="option-editor-grid"></div>
        <p class="correct-note">Select the radio button next to the correct answer.</p>
      </div>
    `);

    options.forEach(function (option, optionIndex) {
      const line = $(`
        <label class="option-line">
          <input type="radio" name="correct_${index}" value="${optionIndex}"
            ${optionIndex === Number(answer) ? "checked" : ""}>
          <input class="option-input" required maxlength="200"
            placeholder="Option ${String.fromCharCode(65 + optionIndex)}"
            value="${escapeHTML(option)}">
        </label>
      `);
      card.find(".option-editor-grid").append(line);
    });

    $("#questionEditor").append(card);
    updateQuestionCount();
  }

  function resetEditor() {
    isEditingSavedQuiz = false;
    editingQuizId = null;
    $("#quizForm")[0].reset();
    $("#quizTitle").val("");
    $("#quizCategory").val("");
    $("#quizTime").val("15");
    $("#questionEditor").empty();
    addQuestionCard();
    addQuestionCard();
    updateQuestionCount();
  }

  function openEditor(quiz = null) {
    $("#questionEditor").empty();
    isEditingSavedQuiz = Boolean(quiz);
    editingQuizId = quiz ? quiz.id : null;

    if (quiz) {
      $("#quizTitle").val(quiz.title);
      $("#quizCategory").val(quiz.category || "");
      $("#quizTime").val(String(quiz.time || 0));
      quiz.questions.forEach(q => addQuestionCard(q));
    } else {
      $("#quizForm")[0].reset();
      $("#quizTime").val("15");
      addQuestionCard();
      addQuestionCard();
    }

    showScreen("editorScreen");
  }

  function collectQuiz() {
    const title = $("#quizTitle").val().trim();
    const category = $("#quizCategory").val().trim() || "General";
    const time = Number($("#quizTime").val());
    const questionCards = $("#questionEditor .question-editor");

    if (!title) {
      alert("Please enter a quiz title.");
      return null;
    }

    if (!questionCards.length) {
      alert("Add at least one question.");
      return null;
    }

    const collectedQuestions = [];
    let error = "";

    questionCards.each(function (index) {
      const card = $(this);
      const question = card.find(".question-input").val().trim();
      const options = card.find(".option-input").map(function () {
        return $(this).val().trim();
      }).get();
      const answer = card.find('input[type="radio"]:checked').val();

      if (!question || options.some(option => !option)) {
        error = "Please complete the question and all four options for Question " + (index + 1) + ".";
        return false;
      }

      if (new Set(options.map(option => option.toLowerCase())).size !== 4) {
        error = "Each question must have four different options. Check Question " + (index + 1) + ".";
        return false;
      }

      if (answer === undefined) {
        error = "Please select the correct answer for Question " + (index + 1) + ".";
        return false;
      }

      collectedQuestions.push({
        question,
        options,
        answer: Number(answer)
      });
    });

    if (error) {
      alert(error);
      return null;
    }

    return {
      id: editingQuizId || ("quiz_" + Date.now()),
      title,
      category,
      time,
      questions: collectedQuestions
    };
  }

  function saveQuiz(quiz) {
    let quizzes = readQuizzes();

    if (isEditingSavedQuiz) {
      quizzes = quizzes.map(item => item.id === quiz.id ? quiz : item);
    } else {
      quizzes.push(quiz);
    }

    localStorage.setItem(QUIZ_KEY, JSON.stringify(quizzes));
    updateDashboard();
  }

  function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function startQuiz(quiz) {
    clearInterval(timer);
    currentQuiz = JSON.parse(JSON.stringify(quiz));
    currentIndex = 0;
    score = 0;
    answerHistory = [];

    $("#playTitle").text(currentQuiz.title);
    $("#playCategory").text(currentQuiz.category || "GENERAL");
    $("#liveScore").text("Score: 0");
    showScreen("playScreen");
    showQuestion();
  }

  function showQuestion() {
    clearInterval(timer);
    locked = false;

    const q = currentQuiz.questions[currentIndex];
    $("#progressText").text(
      "Question " + (currentIndex + 1) + " of " + currentQuiz.questions.length
    );
    $("#questionTag").text("QUESTION " + String(currentIndex + 1).padStart(2, "0"));
    $("#progressBar").css(
      "width",
      (currentIndex / currentQuiz.questions.length * 100) + "%"
    );
    $("#questionText").text(q.question);
    $("#answerFeedback").text("").removeClass("good bad");
    $("#nextQuestion").prop("disabled", true).text(
      currentIndex === currentQuiz.questions.length - 1 ? "See results →" : "Next question →"
    );

    const optionOrder = shuffle([0, 1, 2, 3]);
    $("#playOptions").empty();

    optionOrder.forEach(function (originalIndex, displayIndex) {
      const button = $("<button>", {
        type: "button",
        class: "option-btn",
        text: String.fromCharCode(65 + displayIndex) + ". " + q.options[originalIndex]
      });

      button.data("original-index", originalIndex);
      $("#playOptions").append(button);
    });

    if (currentQuiz.time > 0) {
      timeLeft = currentQuiz.time;
      updateTimerText();
      timer = setInterval(function () {
        timeLeft--;
        updateTimerText();
        if (timeLeft <= 0) {
          clearInterval(timer);
          if (!locked) {
            submitAnswer(null);
          }
        }
      }, 1000);
    } else {
      $("#timerText").text("No timer");
    }
  }

  function updateTimerText() {
    $("#timerText").text("⏱ " + timeLeft + "s");
    $("#timerText").css("color", timeLeft <= 5 ? "#d64e5a" : "");
  }

  function submitAnswer(selectedIndex) {
    if (locked) return;
    locked = true;
    clearInterval(timer);

    const q = currentQuiz.questions[currentIndex];
    const correct = selectedIndex === q.answer;

    if (correct) score++;

    $("#playOptions .option-btn").each(function () {
      const originalIndex = Number($(this).data("original-index"));
      $(this).prop("disabled", true);

      if (originalIndex === q.answer) $(this).addClass("correct");
      if (originalIndex === selectedIndex && !correct) $(this).addClass("wrong");
    });

    if (selectedIndex === null) {
      $("#answerFeedback").text("Time's up! The correct answer is: " + q.options[q.answer])
        .addClass("bad");
    } else if (correct) {
      $("#answerFeedback").text("Correct! Great job.").addClass("good");
    } else {
      $("#answerFeedback").text("Not quite. Correct answer: " + q.options[q.answer])
        .addClass("bad");
    }

    answerHistory.push({
      question: q.question,
      selected: selectedIndex === null ? "No answer (time expired)" : q.options[selectedIndex],
      correct: q.options[q.answer],
      isCorrect: correct
    });

    $("#liveScore").text("Score: " + score);
    $("#progressBar").css(
      "width",
      ((currentIndex + 1) / currentQuiz.questions.length * 100) + "%"
    );
    $("#nextQuestion").prop("disabled", false);
  }

  function finishQuiz() {
    clearInterval(timer);
    const total = currentQuiz.questions.length;
    const percent = Math.round(score / total * 100);
    const stats = readStats();

    stats.completed++;
    stats.best = Math.max(stats.best, percent);
    saveStats(stats);

    $("#resultScore").text(score + "/" + total);
    $("#resultPercent").text(percent + "% score");
    $("#resultTitle").text(
      percent === 100 ? "Perfect score!" :
      percent >= 70 ? "Great work!" :
      percent >= 40 ? "Good effort!" : "Keep practising!"
    );
    $("#resultMessage").text("You answered " + score + " out of " + total + " questions correctly.");
    $("#resultIcon").text(percent >= 70 ? "🏆" : percent >= 40 ? "✨" : "💪");

    $("#answerReview").empty();
    answerHistory.forEach(function (item, index) {
      const review = $(`
        <div class="review-item">
          <strong>${index + 1}. ${escapeHTML(item.question)}</strong>
          <p class="${item.isCorrect ? "review-correct" : "review-wrong"}">
            Your answer: ${escapeHTML(item.selected)}
          </p>
          <p>Correct answer: ${escapeHTML(item.correct)}</p>
        </div>
      `);
      $("#answerReview").append(review);
    });

    updateDashboard();
    showScreen("resultScreen");
  }

  function playSampleQuiz() {
    $("#sampleBtn").prop("disabled", true).text("Loading quiz...");
    $("#answerFeedback").text("");

    // AJAX fetches fresh questions. If it fails, the built-in sample quiz is used.
    $.ajax({
      url: "https://opentdb.com/api.php",
      method: "GET",
      dataType: "json",
      timeout: 7000,
      data: { amount: 10, type: "multiple" }
    }).done(function (response) {
      if (response.response_code !== 0 || !response.results.length) {
        startQuiz({
          id: "sample",
          title: "Web & General Knowledge",
          category: "Sample Quiz",
          time: 15,
          questions: sampleQuestions
        });
        return;
      }

      const decode = text => $("<textarea>").html(text).text();
      const onlineQuestions = response.results.map(function (item) {
        const options = shuffle([
          decode(item.correct_answer),
          ...item.incorrect_answers.map(decode)
        ]);
        return {
          question: decode(item.question),
          options,
          answer: options.indexOf(decode(item.correct_answer))
        };
      });

      startQuiz({
        id: "online_" + Date.now(),
        title: "Daily Knowledge Challenge",
        category: "Online Quiz",
        time: 15,
        questions: onlineQuestions
      });
    }).fail(function () {
      startQuiz({
        id: "sample",
        title: "Web & General Knowledge",
        category: "Sample Quiz",
        time: 15,
        questions: sampleQuestions
      });
    }).always(function () {
      $("#sampleBtn").prop("disabled", false).text("Play sample quiz");
    });
  }

  // Navigation
  $("#homeBtn, #backHome, #cancelEditor, #resultHome").on("click", function (event) {
    event.preventDefault();
    clearInterval(timer);
    updateDashboard();
    showScreen("homeScreen");
  });

  $("#createNav, #heroCreate, #createCardBtn").on("click", function () {
    resetEditor();
    showScreen("editorScreen");
  });

  $("#playNav, #heroPlay, #sampleBtn").on("click", function () {
    playSampleQuiz();
  });

  $("#addQuestion").on("click", function () {
    addQuestionCard();
  });

  $("#questionEditor").on("click", ".remove-question", function () {
    if ($("#questionEditor .question-editor").length <= 1) {
      alert("Your quiz must have at least one question.");
      return;
    }
    $(this).closest(".question-editor").remove();
    $("#questionEditor .question-editor").each(function (index) {
      $(this).find(".question-editor-head strong").text("Question " + (index + 1));
      $(this).find('input[type="radio"]').attr("name", "correct_" + (index + 1));
    });
    updateQuestionCount();
  });

  $("#quizForm").on("submit", function (event) {
    event.preventDefault();
    const quiz = collectQuiz();
    if (!quiz) return;

    saveQuiz(quiz);
    isEditingSavedQuiz = true;
    editingQuizId = quiz.id;

    if (confirm("Quiz saved! Would you like to take it now?")) {
      startQuiz(quiz);
    } else {
      updateDashboard();
      showScreen("homeScreen");
    }
  });

  $("#savedQuizzes").on("click", ".play-saved", function () {
    const quiz = readQuizzes().find(q => q.id === $(this).data("id"));
    if (quiz) startQuiz(quiz);
  });

  $("#savedQuizzes").on("click", ".edit-saved", function () {
    const quiz = readQuizzes().find(q => q.id === $(this).data("id"));
    if (quiz) openEditor(quiz);
  });

  $("#savedQuizzes").on("click", ".delete-saved", function () {
    const id = String($(this).data("id"));
    if (!confirm("Delete this saved quiz?")) return;

    const quizzes = readQuizzes().filter(q => q.id !== id);
    localStorage.setItem(QUIZ_KEY, JSON.stringify(quizzes));
    updateDashboard();
  });

  $("#playOptions").on("click", ".option-btn", function () {
    submitAnswer(Number($(this).data("original-index")));
  });

  $("#nextQuestion").on("click", function () {
    if (!locked) return;
    if (currentIndex < currentQuiz.questions.length - 1) {
      currentIndex++;
      showQuestion();
    } else {
      finishQuiz();
    }
  });

  $("#exitQuiz").on("click", function () {
    if (confirm("Exit this quiz? Your current attempt will not be counted.")) {
      clearInterval(timer);
      updateDashboard();
      showScreen("homeScreen");
    }
  });

  $("#playAgain").on("click", function () {
    if (currentQuiz) startQuiz(currentQuiz);
  });

  updateDashboard();
});
