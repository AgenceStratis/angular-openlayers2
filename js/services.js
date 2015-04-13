angular.module("cartoServices", [])
    .service("$thematics", function () {
        var self = this;
        self.thematics = [
            {value: "14", text: "Concert"},
            {value: "33", text: "Animation"},
            {value: "14", text: " Concert"},
            {value: "27", text: " Événement sportif"},
            {value: "16", text: " Exposition"},
            {value: "25", text: " Musique"},
            {value: "29", text: " Spectacle"}
        ];

        self.getAll = function(){
            return self.thematics;
        }
    })
;