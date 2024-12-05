package application.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@JsonSerialize
public class User {
    @JsonProperty("id")
    public String id;
    @JsonProperty("name")
    public String name;
    @JsonProperty("secondName")
    public String secondName;
    @JsonProperty("mail")
    public String mail;
    @JsonProperty("login")
    public String login;
    @JsonProperty("password")
    public String password;
}
